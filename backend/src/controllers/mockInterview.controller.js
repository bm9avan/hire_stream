import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { mockInterview } from "../db/schema.js";

export const GetInterviewList = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(mockInterview)
      .where(eq(mockInterview.uid, req.user.uid))
      .orderBy(desc(mockInterview.id));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching mock interviews:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching mock interviews",
      error: error.message,
    });
  }
};

export const getMockInterview = async (req, res) => {
  const { mockId } = req.params;
  try {
    const result = await db.query.mockInterview.findFirst({
      where: (table, fn) => fn.eq(table.id, mockId),
      with: {
        job: {},
      },
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching mock interview:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching mock interview",
      error: error.message,
    });
  }
};

export const createMockInterview = async (req, res) => {
  const { jobId } = req.params;
  const { questions: jsonMockResp } = req.body;
  console.log("mock creation", req.body, req.params);
  try {
    const result = await db
      .insert(mockInterview)
      .values({ jobId, jsonMockResp, uid: req.user.uid })
      .returning();
    console.log(result[0].id);
    res.status(200).json({ success: true, data: { mockId: result[0].id } });
  } catch (error) {
    console.error("Error creating mock interview:", error);
    res.status(500).json({
      success: false,
      message: "Error creating mock interview",
      error: error.message,
    });
  }
};
