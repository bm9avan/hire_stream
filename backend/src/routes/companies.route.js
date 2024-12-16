import express from "express";
import {
  addCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companies.controller.js";
import { verifyAdmin } from "../middleware/user.middleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public routes - No authentication required
router.get("/", getCompanies);
router.get("/:id", getCompany);

// Admin-only routes - Requires admin verification
router.post("/", verifyAdmin, upload.single("logo"), addCompany);
router.put("/:id", verifyAdmin, upload.single("logo"), updateCompany);
router.delete("/:id", verifyAdmin, deleteCompany);

export default router;
