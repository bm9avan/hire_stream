import express from "express";
import {
  acceptApplication,
  addJob,
  appliedJobs,
  applyForJob,
  deleteJob,
  getClosedJobs,
  getInterviewJobs,
  getJob,
  getJobs,
  getMyJobs,
  getOaJobs,
  getOpenJobs,
  rejectApplication,
  updateJob,
  UpdateJobStatus,
  voteJob,
  withdrawApplication,
} from "../controllers/jobs.controller.js";
import upload from "../middleware/multer.js";
import {
  verifyAdmin,
  verifyToken,
  verifyUser,
} from "../middleware/user.middleware.js";

const router = express.Router();

router.get("/", getJobs);
router.post("/", verifyAdmin, upload.single("jdPdf"), addJob);
router.get("/myjobs", verifyToken, getMyJobs);
router.get("/:jobId", getJob);
router.post("/:jobId/vote", verifyToken, voteJob);

router.get("/status/open", getOpenJobs);
router.get("/status/oa", getOaJobs);
router.get("/status/interview", getInterviewJobs);
router.get("/status/closed", getClosedJobs);

router.put("/status/:jobId/:status", verifyAdmin, UpdateJobStatus);
router.put("/:jobId", verifyAdmin, upload.single("jdPdf"), updateJob);
router.delete("/:jobId", verifyAdmin, deleteJob);
router.put("/:jobId/accept", verifyAdmin, acceptApplication);
router.put("/:jobId/reject", verifyAdmin, rejectApplication);

router.get("/:jobId/applied", appliedJobs); // lsit of all jobs applied by students
router.post("/:jobId/apply", verifyToken, applyForJob);
router.delete("/:jobId/withdraw", verifyToken, withdrawApplication);

export default router;
