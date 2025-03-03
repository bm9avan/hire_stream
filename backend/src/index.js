import cookiesParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.route.js";
import branchRoutes from "./routes/branches.route.js";
import collegeRoutes from "./routes/colleges.route.js";
import companyRoutes from "./routes/companies.route.js";
import jobRoutes from "./routes/jobs.route.js";
import userRoutes from "./routes/user.route.js";
import mockInterviewRoutes from "./routes/mockInterview.route.js";
import cors from "cors";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookiesParser());
app.use(cors());

app.get("/", (req, res) => {
  return res.send("Hello, World!");
});
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/mockinterview", mockInterviewRoutes);

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
