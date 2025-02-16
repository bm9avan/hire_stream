import bcryptjs from "bcryptjs";
import { sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import db from "../db/index.js";
import { branches, colleges, users } from "../db/schema.js";
import { errorHandler } from "../utils/error.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";
import fs from "fs";

export const signup = async (req, res, next) => {
  const {
    uid,
    name,
    email,
    password,
    dob,
    phoneNo,
    collegeId,
    branchId,
    profileImageUrl,
    role,
    isit,
    ...others
  } = req.body;
  console.log(req.body);
  if (
    !uid ||
    !name ||
    !email ||
    !password ||
    !dob ||
    !collegeId ||
    !phoneNo ||
    uid === "" ||
    name === "" ||
    email === "" ||
    password === "" ||
    dob === "" ||
    collegeId === ""
  ) {
    console.log(uid, name, email, password, dob, collegeId);
    return next(errorHandler(400, "All required fields must be filled", res));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(errorHandler(400, "Invalid email format",res));
  }

  const userRoleRegex =
    /^(admin|placement-staff|department-staff|viewer|student)$/;
  let userRole = "student";
  if (!role) {
    userRole = "student";
  } else if (branchId === "placement") {
    if (role === "view") {
      userRole = "viewer";
    } else {
      userRole = "placement-staff";
    }
  } else {
    if (role === "view") {
      userRole = "viewer";
    } else {
      userRole = "department-staff";
    }
  }

  if (!userRoleRegex.test(userRole)) {
    return next(errorHandler(400, "Invalid user role", res));
  }

  try {
    // Check for duplicate email
    const existingEmail = await db.query.users.findFirst({
      where: (table, fn) => fn.eq(table.email, email),
    });
    console.log(existingEmail);
    if (existingEmail) {
      return next(errorHandler(400, "Email already exists", res));
    }

    // Hash the password
    const hashedPassword = bcryptjs.hashSync(password, 10);
    console.log(hashedPassword);
    // Insert new user
    const userCreated = await db
      .insert(users)
      .values({
        uid,
        name,
        email,
        password: hashedPassword,
        dob,
        phoneNo,
        collegeId,
        branchId,
        role: userRole,
        verified: false,
        profileImageUrl,
        ...others,
      })
      .returning({
        ...users,
        college: {
          collegeId: colleges.collegeId,
          name: colleges.name,
          // logoUrl: colleges.logoUrl,
        },
        branch: { branchId: branches.branchId, name: branches.name },
      });

    console.log(userCreated);
    // const validUser = await db.query.users.findFirst({
    //   where: (table, fn) => fn.eq(table.email, email),
    //   with: {
    //     college: { description: false },
    //     branch: { description: false },
    //   },
    // });
    if (!userCreated[0]) {
      return next(
        errorHandler(404, "Error Signing up, please try signing in again", res)
      );
    }
    const { password: pass, ...rest } = userCreated[0];
    const token = jwt.sign(
      {
        uid: userCreated[0].uid,
        role: userCreated[0].role,
      },
      process.env.JWT_SECRET
    );
    // await db.insert(requests).values({
    //   uid,
    //   collegeId,
    //   branchId,
    //   createdAt: new Date(),
    // });
    console.log(rest, "isit", isit);
    if (isit) {
      console.log("inside the isit");
      res.status(200).json({ message: "User created successfully", ...rest });
      return;
    } else {
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        })
        .json(rest);
    }

    // res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log("inside signup", error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
    // next(errorHandler(500, error.message));
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email.trim() === "" || password.trim() === "") {
    return next(errorHandler(400, "All fields are required"));
  }
  console.log(email, password);
  try {
    const validUser = await db.query.users.findFirst({
      where: (table, fn) => fn.eq(table.email, email),
      with: {
        college: { description: false },
        branch: { description: false },
      },
    });
    console.log(validUser);
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Invalid Password"));
    }

    const token = jwt.sign(
      {
        uid: validUser.uid,
        role: validUser.role,
      },
      process.env.JWT_SECRET
    );

    const { password: pass, ...others } = validUser;
    console.log(others);
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

export const google = async (req, res, next) => {
  console.log("google", req.body);
  const { email, name, googlePhotoUrl } = req.body;
  console.log(email, name, googlePhotoUrl);
  try {
    const user = await db.query.users.findFirst({
      where: (table, fn) => fn.eq(table.email, email),
      with: {
        college: { name: true, collegeId: true },
        branch: { description: false },
      },
    });
    if (user) {
      console.log(user.uid);
      if (!user.profileImageUrl) {
        await db
          .update(users)
          .set({ profileImageUrl: googlePhotoUrl })
          .where(sql`uid = ${user.uid}`);
      }
      const token = jwt.sign(
        { uid: user.uid, role: user.role },
        process.env.JWT_SECRET
      );
      console.log({ uid: user.uid, role: user.role });
      const { password, ...others } = user;
      console.log("others", others);
      return res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        })
        .json({ profileImageUrl: googlePhotoUrl, ...others });
    } else {
      // const generatedPassword =
      //   Math.random().toString(36).slice(-8) +
      //   Math.random().toString(36).slice(-8);
      // const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      // const newUser = await db.insert(users).values({
      //   uid: name,
      //   name:
      //     name.toLowerCase().split(" ").join("") +
      //     Math.random().toString(9).slice(-4),
      //   email,
      //   password: hashedPassword,
      //   profileImageUrl: googlePhotoUrl,
      // });
      // const token = jwt.sign(
      //   { uid: newUser.uid, role: newUser.role },
      //   process.env.JWT_SECRET
      // );
      // const { password, ...rest } = newUser;
      // return res
      //   .status(200)
      //   .cookie("access_token", token, {
      //     httpOnly: true,
      //     maxAge: 365 * 24 * 60 * 60 * 1000,
      //   })
      //   .json(rest);
      return next(errorHandler(404, "User not found"));
    }
  } catch (error) {
    next(error);
  }
};

export const addDetails = async (req, res, next) => {
  try {
    req.body.collegeId = "bit";
    req.body.branchId = "ise";
    req.body.role = "student";
    req.body.verified = true;
    req.body.batch = 2025;
    req.body.isit = true;
    console.log(Date.now(), req.body, req.file);
    const responce = await cloudinaryUpload(req.file.path);
    console.log(responce);
    req.body.profileImageUrl = responce.url;
    fs.unlinkSync(req.file.path);

    return signup(req, res, next);
  } catch (error) {
    console.log(Date.now(), "object creation details", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
