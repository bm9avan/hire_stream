import express from "express";
import { getBranchesList } from "../controllers/branches.controller.js";

const router = express.Router();

router.get("/", getBranchesList);

export default router;
