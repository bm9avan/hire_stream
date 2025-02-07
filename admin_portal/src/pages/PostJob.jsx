import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Loader2, Upload, X } from "lucide-react";
import { editActions } from "../redux/edit/editSlice";

const JobForm = ({ user }) => {
  const dispatch = useDispatch();
  const jId = useSelector((state) => state.edit.jId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [jdInputType, setJdInputType] = useState("url");

  const [companies, setCompanies] = useState([]);
  console.log(user.collegeId);
  const {
    register,
    handleSubmit: formSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/companies");
        const data = await response.json();
        setCompanies(data.data);
      } catch (err) {
        setError("Failed to fetch companies");
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (jId) {
      setValue("role", jId.role);
      setValue("description", jId.description);
      setValue("collegeId", jId.collegeId);
      setValue("companyId", jId.companyId);
      setValue("deadline", new Date(jId.deadline).toISOString().split("T")[0]);
      setValue("skills", jId.skills);
      setValue("jobType", jId.jobType);
      setValue("status", jId.status);
      setValue(
        "statusDate",
        jId.statusDate
          ? new Date(jId.statusDate).toISOString().split("T")[0]
          : ""
      );
      if (jId.jdPdfLink) {
        setJdInputType("url");
        setValue("jdPdfLink", jId.jdPdfLink);
        setPdfUrl(jId.jdPdfLink);
      }
    }
    // Set college ID from user
    setValue("collegeId", user?.collegeId);
  }, [jId, setValue, user]);

  const generateJobId = () => {
    return "JOB" + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setPdfUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPdfUrl(null);
    setValue("jdPdfLink", "");
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    setSuccess(false);
    console.log(data);
    try {
      const formData = new FormData();

      if (jId) {
        formData.append("jobId", jId.jobId);
        formData.append("collegeId", jId.collegeId);
        formData.append("companyId", jId.companyId);
        formData.append("status", jId.status);
      } else {
        console.log("no id generated, now generating");
        formData.append("jobId", generateJobId());
      }

      formData.append("role", data.role);
      formData.append("description", data.description);
      formData.append("deadline", data.deadline);
      formData.append("skills", data.skills);
      formData.append("jobType", data.jobType);
      formData.append("branches", data.branches);
      formData.append("batch", data.batch);
      formData.append("cgpa", data.cgpa);

      formData.append("collegeId", user.collegeId); // Use logged-in user's college ID
      if (!jId) {
        formData.append("companyId", data.companyId);
      }
      if (data.statusDate) {
        formData.append("statusDate", data.statusDate);
      }

      if (jdInputType === "upload" && selectedFile) {
        formData.append("jdPdf", selectedFile);
      } else if (jdInputType === "url" && data.jdPdfLink) {
        formData.append("jdPdfLink", data.jdPdfLink);
      }
      console.log(formData, jId);

      const response = await fetch(`/api/jobs${jId ? `/${jId.jobId}` : ""}`, {
        method: jId ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${jId ? "update" : "add"} job`);
      }

      setSuccess(true);
      if (!jId) {
        reset();
        clearFile();
      }
      dispatch(editActions.endEditingJob());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="w-full max-w-xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              <CardTitle>{jId ? "Edit" : "Add New"} Job</CardTitle>
            </div>
            <CardDescription>
              {jId
                ? "Update the job posting details"
                : "Enter the job details to add them to the database"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  {...register("role", { required: "Role is required" })}
                />
                {errors.role && (
                  <span className="text-sm text-red-500">
                    {errors.role.message}
                  </span>
                )}
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="collegeId">College ID</Label>
                <Input
                  id="collegeId"
                  {...register("collegeId", {
                    required: "College ID is required",
                  })}
                />
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register("deadline", {
                    required: "Deadline is required",
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Required Skills</Label>
                <Textarea
                  id="skills"
                  {...register("skills")}
                  placeholder="Enter required skills, separated by commas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter detailed job description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select
                  onValueChange={(value) => setValue("jobType", value)}
                  defaultValue={jId?.jobType || "Select job type"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="companyId">Company ID</Labe l>
                <Input
                  id="companyId"
                  {...register("companyId", {
                    required: "Company ID is required",
                  })}
                />
              </div> */}

              {!jId && (
                <div className="grid gap-2">
                  <Label htmlFor="branchId">Company</Label>
                  <select
                    id="branchId"
                    className="w-full p-2 border rounded-xl bg-background text-foreground"
                    // onChange={handleChange}
                    {...register("companyId", {
                      required: "Company ID is required",
                    })}
                  >
                    <option value="" className="bg-background text-foreground">
                      Select Company
                    </option>
                    {companies.map((company) => (
                      <option
                        key={company.companyId}
                        value={company.companyId}
                        className="bg-background text-foreground"
                      >
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="cgpa">CGPA</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  {...register("cgpa", {
                    required: "CGPA is required",
                    min: { value: 0, message: "CGPA cannot be less than 0" },
                    max: { value: 10, message: "CGPA cannot be more than 10" },
                  })}
                />
                {errors.cgpa && (
                  <span className="text-sm text-red-500">
                    {errors.cgpa.message}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="branches">Branches</Label>
                <Textarea
                  id="branches"
                  {...register("branches", {
                    required: "Branches are required",
                  })}
                  placeholder="Enter branches separated by commas, e.g., CSE, ECE, ME"
                />
                {errors.branches && (
                  <span className="text-sm text-red-500">
                    {errors.branches.message}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input
                  id="batch"
                  type="text"
                  placeholder="e.g., 2024, 2025"
                  {...register("batch", { required: "Batch is required" })}
                />
                {errors.batch && (
                  <span className="text-sm text-red-500">
                    {errors.batch.message}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lpa">Package</Label>
                <Input
                  id="lpa"
                  type="number"
                  placeholder="in terms of lpa"
                  {...register("batch", { required: "Batch is required" })}
                />
              </div>

              <div className="space-y-2">
                <Label>Job Description PDF</Label>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    {/* <Button
                      type="button"
                      variant={jdInputType === "upload" ? "default" : "outline"}
                      onClick={() => setJdInputType("upload")}
                    >
                      Upload PDF
                    </Button> */}
                    <Button
                      type="button"
                      variant={jdInputType === "url" ? "default" : "outline"}
                      onClick={() => setJdInputType("url")}
                    >
                      PDF URL
                    </Button>
                  </div>

                  {jdInputType === "upload" ? (
                    <div>
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                      />
                      {pdfUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View PDF
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      type="url"
                      placeholder="Enter PDF URL"
                      {...register("jdPdfLink")}
                    />
                  )}
                </div>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value) => setValue("status", value)}
                  defaultValue={jId?.status || "open"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="online-assessment">
                      Online Assessment
                    </SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* <div className="space-y-2">
                <Label htmlFor="statusDate">Status Date</Label>
                <Input
                  id="statusDate"
                  type="date"
                  {...register("statusDate")}
                />
              </div> */}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100 border-green-200 dark:border-green-800">
                  <AlertDescription>
                    Job {jId ? "updated" : "added"} successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    clearFile();
                    dispatch(editActions.endEditingJob());
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {jId ? "Updating..." : "Adding..."}
                    </>
                  ) : jId ? (
                    "Update Job"
                  ) : (
                    "Add Job"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobForm;
