import express from "express";
import {
  addDetails,
  google,
  signin,
  signup,
} from "../controllers/auth.controller.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.post(
  "/details",
  upload.single("userimg"),
  addDetails
);

export default router;
