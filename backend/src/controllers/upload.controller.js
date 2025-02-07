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

  export const createUploadStudent = async (req, res) => {
    try {
      const { name, email, branch, year, semester, resume, company, internship } = req.body;
  
      // Upload resume to Cloudinary
      const resumeUrl = await uploadResume(resume);
  
      // Create student
      const newStudent = await db.insert(students).values({
        name,
        email,
        branch,
        year,
        semester,
        resume: resumeUrl,
      }).returning();
  
      res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: newStudent[0],
      });
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({
        success: false,
        message: "Error creating student",
        error: error.message,
      });
    }
  };