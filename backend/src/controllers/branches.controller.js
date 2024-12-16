import db from "../db/index.js";
import { errorHandler } from "../utils/error.js";

export const getBranchesList = async (req, res, next) => {
  try {
    const branches = await db.query.branches.findMany({
      columns: { description: false },
    });
    return res.status(200).json(branches);
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
