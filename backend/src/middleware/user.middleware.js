import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  //console.log(token)
  if (!token) {
    return next(errorHandler(401, "Unauthorized"));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(errorHandler(401, "Unauthorized"));
    }
    console.log(user, req.body);
    req.user = user;
    next();
  });
};

export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.uid !== req.params.userId) {
      return next(errorHandler(403, "You are not allowed to update this user"));
    }
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!(req.user.role === "admin" || req.user.role === "placement-staff")) {
      return next(errorHandler(403, "You are not allowed to do the action"));
    }
    next();
  });
};
