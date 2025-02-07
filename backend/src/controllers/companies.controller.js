import { and, eq, sql } from "drizzle-orm";
import db from "../db/index.js";
import {
  applications,
  branches,
  colleges,
  companies,
  jobs,
  users,
} from "../db/schema.js";
import { cloudinaryUpload, cloudinaryDestroy } from "../utils/cloudinary.js";

// Helper function to extract public ID from Cloudinary URL
const getCloudinaryPublicId = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
};

// Helper function to validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const addCompany = async (req, res) => {
  try {
    const { name, description, logoUrl } = req.body;

    // Generate a unique company ID
    const companyId = "COM" + Date.now().toString(36).toUpperCase();

    let finalLogoUrl = null;

    // Handle logo - either from file upload or direct URL
    if (req.file) {
      // If file is uploaded, use Cloudinary upload
      const response = await cloudinaryUpload(req.file.path);
      finalLogoUrl = response.url;
    } else if (logoUrl) {
      // If logo URL is provided, validate it
      if (!isValidUrl(logoUrl)) {
        return res.status(400).json({
          success: false,
          message: "Invalid logo URL provided",
        });
      }
      finalLogoUrl = logoUrl;
    }

    // Insert company into database
    const newCompany = await db
      .insert(companies)
      .values({
        companyId,
        name,
        description,
        logoUrl: finalLogoUrl,
        questions: [],
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: newCompany[0],
    });
  } catch (error) {
    console.error("Error adding company:", error);
    res.status(500).json({
      success: false,
      message: "Error creating company",
      error: error.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logoUrl } = req.body;

    // Check if company exists
    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.companyId, id))
      .limit(1);

    if (!existingCompany.length) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const updateData = {
      name,
      description,
    };

    // Handle logo update
    if (req.file || logoUrl) {
      // Delete old logo from Cloudinary if it exists and was uploaded through Cloudinary
      if (
        existingCompany[0].logoUrl &&
        existingCompany[0].logoUrl.includes("cloudinary")
      ) {
        const publicId = getCloudinaryPublicId(existingCompany[0].logoUrl);
        if (publicId) {
          await cloudinaryDestroy(publicId);
        }
      }

      if (req.file) {
        // Upload new logo to Cloudinary
        const response = await cloudinaryUpload(req.file.path);
        updateData.logoUrl = response.url;
      } else if (logoUrl) {
        // Validate and use provided URL
        if (!isValidUrl(logoUrl)) {
          return res.status(400).json({
            success: false,
            message: "Invalid logo URL provided",
          });
        }
        updateData.logoUrl = logoUrl;
      }
    }

    // Update company in database
    const updatedCompany = await db
      .update(companies)
      .set(updateData)
      .where(eq(companies.companyId, id))
      .returning();

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: updatedCompany[0],
    });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({
      success: false,
      message: "Error updating company",
      error: error.message,
    });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const allCompanies = await db
      .select()
      .from(companies)
      .orderBy(companies.name);

    res.status(200).json({
      success: true,
      data: allCompanies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching companies",
      error: error.message,
    });
  }
};

export const getCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.companyId, id))
      .limit(1);

    // const company = await db.query.companies.findFirst({where:(table, fn)=> fn.eq(table.companyId, id), with:{q}})
    const selectedStudents = await db
      .select({
        uid: users.uid,
        name: users.name,
        userProfileImg: users.profileImageUrl,
        batch: users.batch,
        selectedJobs: sql`json_agg(
          json_build_object(
            'jobId', ${jobs.jobId}, 
            'role', ${jobs.role}
          )
        )`,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.jobId))
      .innerJoin(users, eq(applications.uid, users.uid))
      .innerJoin(colleges, eq(users.collegeId, colleges.collegeId))
      .leftJoin(branches, eq(users.branchId, branches.branchId))
      .where(
        and(
          eq(jobs.companyId, id),
          eq(jobs.status, "CLOSED"),
          eq(applications.currentStatus, "selected")
        )
      )
      .groupBy(
        users.uid,
        users.name,
        users.email,
        users.phoneNo,
        users.cgpa,
        users.resumeLink,
        colleges.name,
        branches.name
      )
      .orderBy(users.name);

    console.log("object----", selectedStudents);

    if (!company.length) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { company: company[0], palced: selectedStudents },
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching company",
      error: error.message,
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    // Get company to check for logo
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.companyId, id))
      .limit(1);
    console.log("company", company);
    if (!company.length) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Delete logo from Cloudinary if exists
    if (company[0].logoUrl) {
      const publicId = getCloudinaryPublicId(company[0].logoUrl);
      if (publicId) {
        await cloudinaryDestroy(publicId);
      }
    }

    // Delete company from database
    await db.delete(companies).where(eq(companies.companyId, id));

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting company",
      error: error.message,
    });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    const response = await db
      .select({ questions: companies.questions })
      .from(companies)
      .where(eq(companies.companyId, id));
    const oldQuestion = response[0].questions;
    console.log(oldQuestion);

    const newQuestion = await db
      .update(companies)
      .set({ questions: [question, ...oldQuestion] })
      .where(eq(companies.companyId, id))
      .returning();
    res.status(200).json({
      success: true,
      message: "Question added successfully",
      data: newQuestion,
    });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({
      success: false,
      message: "Error adding question",
      error: error.message,
    });
  }
};
