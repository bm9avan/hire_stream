import express from "express";
import { getCollegesList } from "../controllers/colleges.controller.js";

const router = express.Router();

router.get("/", getCollegesList);

export default router;
