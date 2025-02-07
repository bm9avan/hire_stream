import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ExternalLink, Filter, MoreVertical, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { create } from "@/lib/mockInterview/create";

const JobManagement = ({ mode = "open", userCgpa, onClose }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [mockLoader, setMockLoader] = useState(false);
  const [voteLoader, setVoteLoader] = useState(null);
  const navigate = useNavigate();

  // Mapping of modes to filtering logic
  const modeFilters = {
    open: (application) =>
      application.job.status === "OPEN" &&
      (!userCgpa || (application.job.cgpa || 0) <= userCgpa),
    applied: (application) =>
      application.currentStatus === "applied" &&
      application.job.status === "OPEN",
    "online-assessment": (application) =>
      application.job.status === "ONLINE_ASSESSMENT" &&
      application.currentStatus !== "rejected",
    interview: (application) =>
      application.job.status === "INTERVIEW" &&
      ["interview"].includes(application.currentStatus),
    rejected: (application) => application.currentStatus === "rejected",
    selected: (application) =>
      application.currentStatus === "selected" &&
      application.job.status === "CLOSED",
  };

  useEffect(() => {
    setSelectedJob(null);
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        if (mode === "open") {
          const response = await fetch("/api/jobs/status/open");
          const data = await response.json();
          setJobs(data.data);
          // console.log("open");
          // console.log(
          //   "-----------",
          //   window.location,
          //   window.location.pathname.split("/")[2]
          // );
          // console.log(
          //   data,
          //   data.data.find(
          //     (job) => job.jobId === window.location.pathname.split("/")[2]
          //   )
          // );
          if (window.location.pathname.split("/")[2])
            setSelectedJob(
              data.data.find(
                (job) => job.jobId === window.location.pathname.split("/")[2]
              )
            );
          return;
        }
        console.log("in");
        const response = await fetch("/api/jobs/myjobs");
        const data = await response.json();
        console.log(data);
        // Filter jobs based on current mode
        const filteredJobs = data.data
          .filter(modeFilters[mode])
          .map((application) => application.job);

        setJobs(filteredJobs);
      } catch (error) {
        console.error(`Error fetching ${mode} jobs:`, error);
        toast({
          title: "Error",
          description: `Failed to fetch ${mode} jobs`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [mode, userCgpa]);

  // Job Type Configurations
  const jobTypeConfig = {
    internship: { color: "bg-blue-100 text-blue-800", label: "Internship" },
    "full-time": { color: "bg-green-100 text-green-800", label: "Full-Time" },
    both: {
      color: "bg-purple-100 text-purple-800",
      label: "Full-Time + Internship",
    },
  };

  // Filtered and Sorted Jobs
  const filteredAndSortedJobs = useMemo(() => {
    let result = jobs;

    // Search Filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((job) =>
        ["role", "company.name", "skills"].some((field) => {
          const value = field.split(".").reduce((obj, key) => obj[key], job);
          return (
            value && value.toString().toLowerCase().includes(lowerSearchTerm)
          );
        })
      );
    }

    // Sorting by StatusDate/Deadline
    result.sort((a, b) => {
      const dateA = new Date(a.statusDate || a.deadline);
      const dateB = new Date(b.statusDate || b.deadline);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [jobs, searchTerm, sortOrder]);

  // Job Selection Handler
  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setVoteLoader(null);
    // if (window.innerWidth < 640) {
    navigate(`/${window.location.pathname.split("/")[1]}/${job.jobId}`);
    // }
  };

  // Apply Job Handler
  const handleApplyJob = async (job) => {
    try {
      const response = await fetch(`/api/jobs/${job.jobId}/apply`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        if (data.alreadyApplied) {
          toast({
            title: "Error",
            description: "You have already applied for this job",
            variant: "warning",
          });
        } else {
          toast({
            title: "Success",
            description: "Applied for job successfully",
            variant: "success",
          });
        }
        // Optionally refresh jobs or update UI
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      toast({
        title: "Error",
        description: "Failed to apply for job",
        variant: "destructive",
      });
    }
  };

  // Withdraw Application Handler
  const handleWithdrawApplication = async (jobId) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/withdraw`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Withdrew job application",
          variant: "success",
        });

        // Optionally refresh jobs or update UI
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast({
        title: "Error",
        description: "Failed to withdraw application",
        variant: "destructive",
      });
    }
  };

  const handleMockInterview = async () => {
    try {
      setMockLoader(true);
      const questions = await create(selectedJob);
      console.log(questions);
      const response = await fetch(`/api/mockinterview/${selectedJob.jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });
      const data = await response.json();

      if (data.success) {
        setMockLoader(false);
        toast({
          title: "Success",
          description: "Created mock interview",
          variant: "success",
        });
        console.log(data);
        navigate(`/mockinterview/${data.data.mockId}`);
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error Creating mock interview:", error);
      toast({
        title: "Error",
        description: "Failed to create mock interview",
        variant: "destructive",
      });
    }
  };

  console.log("voteLoader", voteLoader);
  const handleVote = async () => {
    try {
      setVoteLoader("Voting...");
      const response = await fetch(`/api/jobs/${selectedJob.jobId}/vote`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        console.log(data.data, data.data.webinarRequested);
        setVoteLoader(`${data.data.webinarRequested} Votes for Webinar`);
        toast({
          title: "Success",
          description: "Voted for Webinar",
          variant: "success",
        });
      } else {
        setVoteLoader(null);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 h-screen p-4 overflow-hidden">
      <div className="flex h-full gap-4 relative">
        {/* Mobile Close Button */}
        {/* {window.innerWidth < 640 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 z-10"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        )} */}

        {/* Job List */}
        <Card
          className={`sm:w-1/3 flex flex-col overflow-hidden 
            ${window.innerWidth < 640 && selectedJob ? "hidden" : ""}`}
        >
          <div className="p-4 flex space-x-2 flex-shrink-0">
            <div className="relative flex-1">
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Earliest</SelectItem>
                <SelectItem value="desc">Latest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CardContent
            className="p-0 flex-1 overflow-y-auto custom-scrollbar"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,0,0,0.2) transparent",
            }}
          >
            {/* Loading and Empty states */}
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <span className="text-muted-foreground">Loading jobs...</span>
              </div>
            ) : filteredAndSortedJobs.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <span className="text-muted-foreground">No jobs found</span>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAndSortedJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                      selectedJob?.jobId === job.jobId
                        ? "bg-primary/10 border-l-4 border-primary"
                        : ""
                    }`}
                    onClick={() => handleJobSelect(job)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{job.role}</h3>
                          <Badge
                            variant="outline"
                            className={`${
                              jobTypeConfig[job.jobType]?.color
                            } capitalize`}
                          >
                            {jobTypeConfig[job.jobType]?.label}
                          </Badge>
                        </div>
                        <Link
                          to={`/companies/${job.companyId}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {job.company.name}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {job.skills.split(",").map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card
          className={`sm:w-2/3 flex flex-col 
            ${window.innerWidth < 640 && !selectedJob ? "hidden" : ""}`}
        >
          {window.innerWidth < 640 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 z-10"
              onClick={() => setSelectedJob(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          )}
          <CardHeader className="flex-row justify-between items-center">
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {selectedJob ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1">
                  {/* Job Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedJob.role}</h2>
                      <Link
                        to={`/companies/${selectedJob.companyId}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {selectedJob.company.name}
                      </Link>
                    </div>
                    <div>
                      <Button
                        disabled={mockLoader}
                        onClick={handleMockInterview}
                      >
                        {mockLoader
                          ? "Creating Interview..."
                          : "Create Mock interview"}
                      </Button>
                    </div>

                    <Badge
                      variant="outline"
                      className={`${
                        jobTypeConfig[selectedJob.jobType]?.color
                      } capitalize`}
                    >
                      {jobTypeConfig[selectedJob.jobType]?.label}
                    </Badge>
                  </div>

                  {/* Eligibility Check for Open Jobs */}
                  {mode === "open" && userCgpa && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Eligibility</h3>
                      {userCgpa >= (selectedJob.cgpa || 0) ? (
                        <Badge variant="success">Eligible</Badge>
                      ) : (
                        <Badge variant="destructive">Not Eligible</Badge>
                      )}
                    </div>
                  )}

                  {/* Skills */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.split(",").map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Branches */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Branches</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.branches.split(",").map((branche, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {branche.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedJob.description}
                    </pre>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold">Deadline</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedJob.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Package</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedJob.lpa} LPA
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Status</h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {selectedJob.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto justify-center">
                  {mode === "open" ? (
                    <Button
                      variant="outline"
                      className="bg-green-500 text-gray-900 hover:bg-green-600 hover:text-black"
                      size="sm"
                      disabled={userCgpa && userCgpa < (selectedJob.cgpa || 0)}
                      onClick={() => handleApplyJob(selectedJob)}
                    >
                      Apply Job
                    </Button>
                  ) : mode === "applied" ? (
                    <Button
                      variant="outline"
                      className="bg-red-500 text-gray-900 hover:bg-red-600 hover:text-black"
                      size="sm"
                      onClick={() =>
                        handleWithdrawApplication(selectedJob.jobId)
                      }
                    >
                      Withdraw Application
                    </Button>
                  ) : null}

                  {selectedJob.jdPdfLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(selectedJob.jdPdfLink, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Job Description
                    </Button>
                  )}
                  <div>
                    <Button
                      disabled={voteLoader}
                      onClick={handleVote}
                      variant="destructive"
                    >
                      {voteLoader ? voteLoader : "Vote for Webinar"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a job to view details.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobManagement;
