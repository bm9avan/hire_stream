import { eq, or, and, inArray } from "drizzle-orm";
import db from "../db/index.js";
import { applications, companies, jobs } from "../db/schema.js";
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

export const addJob = async (req, res) => {
  try {
    const {
      role,
      collegeId,
      description,
      companyId,
      deadline,
      skills,
      jobType,
      status = "open",
      jdPdfLink,
      jdPdf,
      jobId,
    } = req.body;

    let attachmentUrl = null;
    console.log(collegeId);
    // Handle job attachment file upload
    if (req.file) {
      const response = await cloudinaryUpload(req.file.path, "raw");
      attachmentUrl = response.url;
    } else if (jdPdfLink) {
      // Validate application URL if provided
      if (!isValidUrl(jdPdfLink)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application URL provided",
        });
      }
      attachmentUrl = jdPdfLink;
    }

    // Insert job into database
    const newJob = await db
      .insert(jobs)
      .values({
        role,
        collegeId,
        description,
        companyId,
        deadline,
        skills,
        jobType,
        status: status.toUpperCase(),
        jdPdfLink: attachmentUrl,
        jobId: jobId || generateJobId(),
        statusDate: deadline,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: newJob[0],
    });
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).json({
      success: false,
      message: "Error creating job",
      error: error.message,
    });
  }
};

// Helper function to generate job ID
const generateJobId = () => {
  return "JOB" + Date.now().toString(36).toUpperCase();
};

export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      role,
      description,
      companyId,
      deadline,
      skills,
      jobType,
      status,
      jdPdfLink,
    } = req.body;

    console.log("update", req.body, req.params);
    // Check if job exists
    // const existingJob = await db
    //   .select(jobId)
    //   .from(jobs)
    //   .where(eq(jobs.jobId, jobId))
    //   .limit(1);

    const existingJob = await db.query.jobs.findFirst({
      where: (table, fn) => fn.eq(table.jobId, jobId),
    });
    console.log(existingJob);
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const updateData = {
      role,
      description,
      companyId,
      deadline,
      skills,
      jobType,
      status: status ? status.toUpperCase() : "OPEN",
    };

    // Handle attachment update
    // if (req.file || jdPdfLink) {
    //   // Delete old attachment from Cloudinary if it exists
    //   if (
    //     existingJob[0].jdPdfLink &&
    //     existingJob[0].jdPdfLink.includes("cloudinary")
    //   ) {
    //     const publicId = getCloudinaryPublicId(existingJob[0].jdPdfLink);
    //     if (publicId) {
    //       await cloudinaryDestroy(publicId);
    //     }
    //   }

    //   if (req.file) {
    //     // Upload new attachment to Cloudinary
    //     const response = await cloudinaryUpload(req.file.path);
    //     updateData.jdPdfLink = response.url;
    //   } else if (jdPdfLink) {
    //     // Validate and use provided URL
    //     if (!isValidUrl(jdPdfLink)) {
    //       return res.status(400).json({
    //         success: false,
    //         message: "Invalid application URL provided",
    //       });
    //     }
    //     updateData.jdPdfLink = jdPdfLink;
    //   }
    // }

    // Update job in database
    const updatedJob = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.jobId, jobId))
      .returning();

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob[0],
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({
      success: false,
      message: "Error updating job",
      error: error.message,
    });
  }
};

export const UpdateJobStatus = async (req, res) => {
  try {
    const { jobId, status } = req.params;
    // const { status } = req.body;
    // console.log("status", status, req.body, req.params);
    const updatedJob = await db
      .update(jobs)
      .set({ status: status.toUpperCase() })
      .where(eq(jobs.jobId, jobId))
      .returning();

    res.status(200).json({
      success: true,
      message: "Job status updated successfully",
      data: updatedJob[0],
    });
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating job status",
      error: error.message,
    });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { status, companyId, jobType, minSalary, location } = req.query;

    // Build dynamic filter conditions
    const filterConditions = [];

    if (status) {
      filterConditions.push(eq(jobs.status, status.toUpperCase()));
    }
    console.log(status);
    if (companyId) {
      filterConditions.push(eq(jobs.companyId, companyId));
    }

    if (jobType) {
      filterConditions.push(eq(jobs.jobType, jobType));
    }

    // Fetch jobs with applied filters
    const allJobs = await db
      .select()
      .from(jobs)
      .where(and(...filterConditions))
      .orderBy(jobs.role);

    res.status(200).json({
      success: true,
      data: allJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

export const getJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.jobId, jobId))
      .limit(1);

    if (!job.length) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job[0],
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching job",
      error: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get job to check for attachment
    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.jobId, jobId))
      .limit(1);

    if (!job.length) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Delete attachment from Cloudinary if exists
    if (job[0].jdPdfLink) {
      const publicId = getCloudinaryPublicId(job[0].jdPdfLink);
      if (publicId) {
        await cloudinaryDestroy(publicId);
      }
    }

    // Delete job from database
    await db.delete(jobs).where(eq(jobs.jobId, jobId));

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
};

export const getMyJobs = async (req, res) => {
  const { uid } = req.user;
  // console.log("requsted by user", uid, "hi  ", req.user);
  try {
    const allJobs = await db.query.applications.findMany({
      where: (table, fn) => fn.eq(table.uid, uid),
      with: {
        job: {
          with: {
            company: { columns: { description: false } },
          },
        },
      },
    });
    // console.log(allJobs);
    res.status(200).json({
      success: true,
      data: allJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { uid } = req.user;
    const appliedJob = await db
      .select()
      .from(applications)
      .where(and(eq(applications.jobId, jobId), eq(applications.uid, uid)))
      .limit(1);
    if (appliedJob.length) {
      return res.status(300).json({
        success: true,
        alreadyApplied: true,
        message: "You have already applied for this job",
      });
    }
    const newApplication = await db.insert(applications).values({
      jobId,
      uid,
      createdAt: new Date(),
    });
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: newApplication,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({
      success: false,
      message: "Error applying for job",
      error: error.message,
    });
  }
};

export const appliedJobs = async (req, res) => {
  try {
    const { jobId } = req.params;
    const appliedJobs = await db.query.applications.findMany({
      where: (table, fn) => fn.eq(table.jobId, jobId),
      with: {
        user: { columns: { name: true, branchId: true, profileImageUrl: true, uid: true } },
      },
    });
    console.log(appliedJobs);
    res.status(200).json({
      success: true,
      data: appliedJobs,
    });
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applied jobs",
      error: error.message,
    });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.jobId, jobId))
      .limit(1);
    if (!job.length) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    if (job[0].status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "Application Forwared to Company, cant be withdrawn",
      });
    }
    const { uid } = req.user;
    await db
      .delete(applications)
      .where(and(eq(applications.jobId, jobId), eq(applications.uid, uid)));
    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    res.status(500).json({
      success: false,
      message: "Error withdrawing application",
      error: error.message,
    });
  }
};

export const acceptApplication = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { uids, status } = req.body;
    await db
      .update(applications)
      .set({ currentStatus: status })
      .where(
        and(eq(applications.jobId, jobId), inArray(applications.uid, uids))
      )
      .execute();
    const appliedJobs = await db.query.applications.findMany({
      where: (table, fn) => fn.eq(table.jobId, jobId),
      with: {
        user: { columns: { name: true, branchId: true } },
      },
    });
    // next(appliedJobs(req, res));
    console.log("after next", uids, status, req.body, req.params);
    res.status(200).json({
      success: true,
      message: "Application accepted successfully",
      data: appliedJobs,
    });
  } catch (error) {
    console.error("Error accepting application:", error);
    res.status(500).json({
      success: false,
      message: "Error accepting application",
      error: error.message,
    });
  }
};

export const rejectApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { uids } = req.body;
    await db
      .update(applications)
      .set({ currentStatus: "rejected" })
      .where(
        and(eq(applications.jobId, jobId), inArray(applications.uid, uids))
      )
      .execute();
    const appliedJobs = await db.query.applications.findMany({
      where: (table, fn) => fn.eq(table.jobId, jobId),
      with: {
        user: { columns: { name: true, branchId: true } },
      },
    });
    res.status(200).json({
      success: true,
      message: "Application accepted successfully",
      data: appliedJobs,
    });
  } catch (error) {
    console.error("Error accepting application:", error);
    res.status(500).json({
      success: false,
      message: "Error accepting application",
      error: error.message,
    });
  }
};

const getJobsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { companyId } = req.query;
    console.log("inside all stusa", req.query, req.params);
    // Build filter conditions
    const filterConditions = [eq(jobs.status, status.toUpperCase())];

    if (companyId) {
      filterConditions.push(eq(jobs.companyId, companyId));
    }

    // Fetch jobs with applied filters
    const allJobs = await db
      .select({
        ...jobs,
        company: { id: companies.companyId, name: companies.name }, // Assuming 'name' is the column for company name in the companies table
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.companyId))
      .where(and(...filterConditions))
      .orderBy(jobs.deadline);
    console.log("jobs by sttaus", allJobs);

    res.status(200).json({
      success: true,
      data: allJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

// Additional status-specific controllers
export const getOpenJobs = (req, res) => {
  req.params.status = "OPEN";
  return getJobsByStatus(req, res);
};

export const getOaJobs = (req, res) => {
  console.log("came request online assisment");
  req.params.status = "ONLINE_ASSESSMENT";
  return getJobsByStatus(req, res);
};

export const getInterviewJobs = (req, res) => {
  req.params.status = "INTERVIEW";
  return getJobsByStatus(req, res);
};

export const getClosedJobs = (req, res) => {
  req.params.status = "CLOSED";
  return getJobsByStatus(req, res);
};
