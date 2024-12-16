import db from "../db/index.js";
import { errorHandler } from "../utils/error.js";

export const getCollegesList = async (req, res, next) => {
  try {
    const colleges = await db.query.colleges.findMany({
      columns: { description: false },
    });
    return res.status(200).json(colleges);
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
