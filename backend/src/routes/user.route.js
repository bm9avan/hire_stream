import express from "express";
import {
  updateUser,
  // deleteUser,
  signout,
  getUsers,
  getUser,
  verifyUser,
  verifyRequests,
  uploadProfilePicture,
  verifyRequest,
  verifiedUsers,
  getUsersPublic,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/user.middleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.put(
  "/upload/profile",
  verifyToken,
  upload.single("userimg"),
  uploadProfilePicture
);
router.put("/update/:userId", verifyToken, updateUser);
router.post("/isVerified", verifyToken, verifyUser);
router.get("/verifyList", verifyToken, verifyRequests);
router.get("/verifedList", verifyToken, verifiedUsers);
router.put("/verify/:userId", verifyToken, verifyRequest);
// router.delete("/delete/:userId", verifyToken, deleteUser);
router.post("/signout", signout);
router.get("/getusers", verifyToken, getUsers);
router.get("/alllist", getUsersPublic);
router.get("/:userId", verifyToken, getUser);

export default router;
