import bcryptjs from "bcryptjs";
import { and, eq, ne, sql } from "drizzle-orm";
import fs from "fs";
import jwt from "jsonwebtoken";
import db from "../db/index.js";
import { users } from "../db/schema.js";
import { cloudinaryDestroy, cloudinaryUpload } from "../utils/cloudinary.js";
import { errorHandler } from "../utils/error.js";

export const uploadProfilePicture = async (req, res, next) => {
  // try {
  const user = await db.query.users.findFirst({
    where: (table, fn) => fn.eq(table.uid, req.user.uid),
    with: {
      college: { description: false },
      branch: { description: false },
    },
  });
  if (!user) {
    return next(errorHandler(404, "User not found"));
  }
  console.log(req.file);
  const responce = await cloudinaryUpload(req.file.path);
  console.log(responce);
  const updatedUser = await db
    .update(users)
    .set({
      profileImageUrl: responce.url,
    })
    .where(sql`uid = ${user.uid}`)
    .returning(
      users
      // branch: {
      //   branchId: branches.branchId,
      //   name: branches.name,
      //   logoUrl: branches.logoUrl,
      // },
      // college: { collegeId: colleges.collegeId, name: colleges.name },
    );
  console.log(updateUser);
  console.log(responce.url);
  if (user.profileImageUrl) {
    console.log("destroy");
    const hi = await cloudinaryDestroy(
      user.profileImageUrl.slice(
        user.profileImageUrl.lastIndexOf("/") + 1,
        user.profileImageUrl.lastIndexOf(".")
      )
    );
    console.log("hi", hi);
  }
  fs.unlinkSync(req.file.path);
  // res.json({ url: responce.url });
  const { password, ...rest } = updatedUser[0];
  console.log("final hope", rest, user);
  return res
    .status(200)
    .json({ ...rest, branch: user.branch, college: user.college });
  // } catch (error) {
  //   fs.unlinkSync(req.file.path);
  //   next(errorHandler(500, error.message || "Uploading user profile failed"));
  // }
};

export const updateUser = async (req, res, next) => {
  // console.log(req.user.id, req.params.userId);
  if (req.user.uid !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
  const user = await db.query.users.findFirst({
    where: (table, fn) => fn.eq(table.uid, req.user.uid),
    with: {
      college: { description: false },
      branch: { description: false },
    },
  });
  if (!user) {
    return next(errorHandler(404, "User not found"));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.uid) {
    // if (req.body.username.length < 7 || req.body.username.length > 20) {
    //   return next(
    //     errorHandler(400, "Username must be between 7 and 20 characters")
    //   );
    // }
    if (req.body.uid.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    // if (req.body.username !== req.body.username.toLowerCase()) {
    //   return next(errorHandler(400, "Username must be lowercase"));
    // }
    if (!req.body.uid.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
    // req.body.uid = req.body.username.toUpperCase();
    console.log(req.body);
  }
  try {
    const updatedUser = await db
      .update(users)
      .set(req.body)
      .where(sql`uid = ${user.uid}`)
      .returning(users);
    const { password, ...rest } = updatedUser[0];
    if (req.body.uid) {
      const token = jwt.sign(
        {
          uid: updatedUser[0].uid,
          role: updatedUser[0].role,
        },
        process.env.JWT_SECRET
      );
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        })
        .json({ ...rest, branch: user.branch, college: user.college });
    } else {
      return res
        .status(200)
        .json({ ...rest, branch: user.branch, college: user.college });
    }
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

export const verifyUser = async (req, res, next) => {
  const { email } = req.body;

  if (!email || email.trim() === "") {
    return next(errorHandler(400, "Email is required"));
  }
  // console.log(email);
  try {
    const validUser = await db.query.users.findFirst({
      where: (table, fn) => fn.eq(table.email, email),
      with: {
        college: { columns: { description: false } },
        branch: { columns: { description: false } },
      },
    });
    // console.log(validUser);
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }

    const token = jwt.sign(
      {
        uid: validUser.uid,
        role: validUser.role,
      },
      process.env.JWT_SECRET
    );

    const { password: pass, ...others } = validUser;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
      })
      .json(others);
  } catch (err) {
    next(err);
  }
};

export const verifiedUsers = async (req, res, next) => {
  console.log("request came");
  const user = await db
    .select({
      role: users.role,
      collegeId: users.collegeId,
      branchId: users.branchId,
    })
    .from(users)
    .where(eq(users.uid, req.user.uid));
  console.log("request came", user);
  try {
    if (req.user.role === "admin") {
      const adminRequests = await db
        .select({
          uid: users.uid,
          name: users.name,
          email: users.email,
          role: users.role,
          verified: users.verified,
          collegeId: users.collegeId,
          branchId: users.branchId,
        })
        .from(users)
        .where(
          and(
            eq(users.collegeId, user[0].collegeId), // College ID matches the input
            ne(users.role, "student"), // Role is not "student"
            eq(users.verified, true) // Verified is true
          )
        );
      console.log("verified admins", adminRequests);
      return res.status(200).json(adminRequests); // dbrequests will already be an array
    } else {
      const studentRequests = await db
        .select({
          uid: users.uid,
          name: users.name,
          email: users.email,
          verified: users.verified,
          role: users.role,
          branchId: users.branchId,
        })
        .from(users)
        .where(
          and(
            eq(users.collegeId, user[0].collegeId), // College ID matches the input
            eq(users.branchId, user[0].branchId),
            eq(users.role, "student"),
            eq(users.verified, true)
          )
        );

      // const requestsInBranch = await db
      //   .select({
      //     requestId: requests.id,
      //     uid: requests.uid,
      //     collegeId: requests.collegeId,
      //     branchId: requests.branchId,
      //     createdAt: requests.createdAt,
      //   })
      //   .from(requests)
      //   .where((qb) => qb.in(requests.uid, dbusers)); // Match UIDs with requests

      return res.status(200).json(studentRequests); // dbusers will already be an array
    }
  } catch (err) {
    next(err);
  }
};

export const verifyRequests = async (req, res, next) => {
  const user = await db
    .select({
      role: users.role,
      collegeId: users.collegeId,
      branchId: users.branchId,
    })
    .from(users)
    .where(eq(users.uid, req.user.uid));
  console.log("initianl verifiahsdiuahd,", req.user, user);
  try {
    console.log(req.user.role);
    if (req.user.role === "admin") {
      console.log("inside admin");
      const adminRequests = await db
        .select({
          uid: users.uid,
          name: users.name,
          email: users.email,
          role: users.role,
          verified: users.verified,
          collegeId: users.collegeId,
          branchId: users.branchId,
        })
        .from(users)
        .where(
          and(
            eq(users.collegeId, user[0].collegeId), // College ID matches
            ne(users.role, "student"), // Role is not "student"
            eq(users.verified, false) // Verified is false
          )
        );

      console.log(adminRequests);
      return res.status(200).json(adminRequests); // dbrequests will already be an array
    } else {
      const studentRequests = await db
        .select({
          uid: users.uid,
          name: users.name,
          email: users.email,
          verified: users.verified,
          role: users.role,
          branch: users.branchId,
          collegeId: users.collegeId,
        })
        .from(users)
        .where(
          and(
            eq(users.collegeId, user[0].collegeId), // College ID matches the input
            eq(users.branchId, user[0].branchId),
            eq(users.role, "student"),
            eq(users.verified, false) // Verified is false
          )
        );

      // const requestsInBranch = await db
      //   .select({
      //     requestId: requests.id,
      //     uid: requests.uid,
      //     collegeId: requests.collegeId,
      //     branchId: requests.branchId,
      //     createdAt: requests.createdAt,
      //   })
      //   .from(requests)
      //   .where((qb) => qb.in(requests.uid, dbusers)); // Match UIDs with requests

      return res.status(200).json(studentRequests); // dbusers will already be an array
    }
  } catch (err) {
    next(err);
  }
};

export const verifyRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { verified } = req.body;
    console.log(req.params, verified);
    const result = await db
      .update(users)
      .set({ verified })
      .where(eq(users.uid, userId));
    console.log(result);
    res.status(200).json({ message: "Request has been verified" });
  } catch (err) {
    next(err);
  }
};

// export const deleteUser = async (req, res, next) => {
//   if (!req.user.isAdmin && req.user.id !== req.params.userId) {
//     return next(errorHandler(403, "You are not allowed to delete this user"));
//   }
//   try {
//     await db.query.users.delete({ where: { id: req.params.userId } });
//     res.status(200).json({ message: "users has been Deleted" });
//   } catch (err) {
//     next(err);
//   }
// };

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("users has been signed out");
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to view users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sort = req.query.sort === "asc" ? 1 : -1;

    const users = await db.query.users
      .select()
      .orderBy("createdAt", sort)
      .offset(startIndex)
      .limit(limit);
    const usersWithOutPassword = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    const totalUsers = await db.query.users.count();
    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthUsers = await db.query.users.count({
      where: { createdAt: { gte: oneMonthAgo } },
    });
    return res.status(200).json({
      users: usersWithOutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (err) {
    next(err);
  }
};

export const getUsersPublic = async (req, res, next) => {
  // if (!req.user.isAdmin) {
  //   return next(errorHandler(403, "You are not allowed to view users"));
  // }
  try {
    // const startIndex = parseInt(req.query.startIndex) || 0;
    // const limit = parseInt(req.query.limit) || 9;
    const sort = req.query.sort === "asc" ? 1 : -1;

    const users = await db.query.users.findMany();
    // .orderBy("createdAt", sort);
    // .offset(startIndex)
    // .limit(limit);
    const usersWithOutPassword = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    // const totalUsers = await db.query.users.count();
    // const now = new Date();

    // const oneMonthAgo = new Date(
    //   now.getFullYear(),
    //   now.getMonth() - 1,
    //   now.getDate()
    // );

    // const lastMonthUsers = await db.query.users.count({
    //   where: { createdAt: { gte: oneMonthAgo } },
    // });
    return res.status(200).json({ users: usersWithOutPassword });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    console.log("req");
    const user = await db.query.users.findFirst({
      where: (table, fn) => fn.eq(table.uid, req.params.userId),
      with: {
        college: { description: false },
        branch: { description: false },
      },
    });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password, ...rest } = user;
    return res.status(200).json(rest);
  } catch (err) {
    next(err);
  }
};
