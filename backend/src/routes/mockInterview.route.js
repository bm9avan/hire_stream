import express from "express";
import {
  createMockInterview,
  GetInterviewList,
  getMockInterview,
} from "../controllers/mockInterview.controller.js";
import { verifyToken } from "../middleware/user.middleware.js";

const router = express.Router();

router.get("/", verifyToken, GetInterviewList);
router.get("/:mockId", verifyToken, getMockInterview);
router.post("/:jobId", verifyToken, createMockInterview);

export default router;
