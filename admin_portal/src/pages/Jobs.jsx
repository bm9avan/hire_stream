import TableSelecter from "@/components/non-shadcn/TableSelecter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { editActions } from "@/redux/edit/editSlice";
import {
  BadgeCheck,
  CheckCircle,
  Edit,
  ExternalLink,
  Filter,
  LoaderPinwheel,
  LogOut,
  MoreVertical,
  Search,
  Trash,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PosterGenerater from "@/components/non-shadcn/PosterGenerater";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const jobStatus = {
  open: {
    currentStatus: "OPEN",
    nextStatus: "ONLINE_ASSESSMENT",
    accept: "online-assessment",
    title: "Close Application",
    icon: LogOut,
    buttonVariant: "outline",
  },
  oa: {
    currentStatus: "ONLINE_ASSESSMENT",
    accept: "interview",
    nextStatus: "INTERVIEW",
    title: "Proceed to Interview",
    icon: Users,
    buttonVariant: "default",
  },
  interview: {
    currentStatus: "INTERVIEW",
    accept: "selected",
    nextStatus: "CLOSED",
    title: "Close Application",
    icon: CheckCircle,
    buttonVariant: "success",
  },
  closed: {
    currentStatus: "CLOSED",
    accept: null,
    nextStatus: null,
    title: "Job Process Completed",
    icon: BadgeCheck,
    buttonVariant: "secondary",
  },
};

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState(null);
  const [status, setStatus] = useState("open");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [isMobileJobDetailView, setIsMobileJobDetailView] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setSelectedJob(null);
      setApplications(null);
      setSearchTerm("");
      console.log(status);
      try {
        const response = await fetch(
          // `/api/jobs/status/${jobStatus[status].currentStatus}`
          `/api/jobs/status/${status}`
        );
        const data = await response.json();
        setJobs(data.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast({
          title: "Error",
          description: "Failed to fetch jobs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [status]);

  console.log(applications);
  useEffect(() => {
    if (!selectedJob) return;
    setApplications(null);
    async function fetchJob() {
      try {
        const response = await fetch(`/api/jobs/${selectedJob.jobId}/applied`);
        const data = await response.json();
        setApplications(data.data);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast({
          title: "Error",
          description: "Failed to fetch job",
          variant: "destructive",
        });
      }
    }
    fetchJob();
  }, [selectedJob]);

  const saveAsExcel = (data, fileName = "data.xlsx") => {
    if (!data || data.length === 0) {
      console.error("No data provided to export.");
      return;
    }

    try {
      // Convert data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      // Create a blob and trigger download
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, fileName);

      console.log("Excel file generated successfully!");
    } catch (error) {
      console.error("Error while generating Excel file:", error);
    }
  };

  const handleEdit = (job) => {
    dispatch(editActions.startEditingJob(job));
    navigate("/forms/job");
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    console.log(jobToDelete);
    try {
      await fetch(`/api/jobs/${jobToDelete.jobId}`, { method: "DELETE" });
      setJobs(jobs.filter((job) => job.jobId !== jobToDelete.jobId));
      setDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const handleAcceptUsers = async (uids) => {
    console.log("using users", uids, selectedJob);
    try {
      const response = await fetch(`/api/jobs/${selectedJob.jobId}/accept`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uids, status: jobStatus[status].accept }),
      });
      const data = await response.json();
      console.log(data);
      setApplications(data.data);
      // setJobs(jobs.filter((job) => job.jobId !== job.jobId));
      // setSelectedJob(null);
    } catch (error) {
      console.error("Error accepting job:", error);
      toast({
        title: "Error",
        description: "Failed to accept job",
        variant: "destructive",
      });
    }
  };

  const handleRejectUsers = async (uids) => {
    console.log("using users", uids);
    try {
      const response = await fetch(`/api/jobs/${selectedJob.jobId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uids }),
      });
      const data = await response.json();
      console.log(data);
      setApplications(data.data);
      // setJobs(jobs.filter((job) => job.jobId !== job.jobId));
      // setSelectedJob(null);
    } catch (error) {
      console.error("Error accepting job:", error);
      toast({
        title: "Error",
        description: "Failed to accept job",
        variant: "destructive",
      });
    }
  };

  const handleBackendStatusChange = async (job) => {
    const response = await fetch(
      `/api/jobs/status/${job.jobId}/${jobStatus[status].nextStatus}`,
      {
        method: "PUT",
        // body: JSON.stringify({ status: job.status }),
      }
    );
    const data = await response.json();
    if (data.success) {
      setJobs(jobs.filter((j) => j.jobId !== job.jobId));
      setSelectedJob(null);
    }
  };
  // Filtering and Sorting
  const filteredAndSortedJobs = useMemo(() => {
    let result = jobs;

    // Advanced Search Filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((job) =>
        // ["role", "company.name", "skills", "description"]
        ["role", "company.name", "skills"].some((field) => {
          const value = field.split(".").reduce((obj, key) => obj[key], job);
          return (
            value && value.toString().toLowerCase().includes(lowerSearchTerm)
          );
        })
      );
    }

    // Sorting by Deadline
    result?.sort((a, b) => {
      const dateA = new Date(a.deadline);
      const dateB = new Date(b.deadline);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [jobs, searchTerm, sortOrder]);

  // Job Type Color and Label Mapping
  const jobTypeConfig = {
    internship: { color: "bg-blue-100 text-blue-800", label: "Internship" },
    "full-time": { color: "bg-green-100 text-green-800", label: "Full-Time" },
    both: {
      color: "bg-purple-100 text-purple-800",
      label: "Full-Time + Internship",
    },
  };

  const getJobTypeDisplay = (jobType) => {
    return jobTypeConfig[jobType]?.label || jobType;
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    if (window.innerWidth < 640) {
      navigate(`/jobs/${job.id}`);
    }
  };

  const icon = jobStatus[status];
  return (
    <div className="bg-gray-50 dark:bg-gray-900 h-screen p-4 overflow-hidden">
      <div className="flex h-full gap-4 relative">
        {/* Job List */}
        <Card
          className={`sm:w-1/3 flex flex-col overflow-hidden 
            ${window.innerWidth < 640 && selectedJob ? "hidden" : ""}`}
        >
          <CardHeader className="flex-shrink-0 flex-row items-center space-x-4">
            <span className="font-semibold">Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="oa">Online Assessment</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>

          <div className="px-4 flex space-x-2 flex-shrink-0">
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

          {/* Custom Scrollbar */}
          <CardContent
            className="p-0 flex-1 overflow-y-auto custom-scrollbar"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,0,0,0.2) transparent",
            }}
          >
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
              }
            `}</style>

            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <span className="text-muted-foreground">Loading jobs...</span>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAndSortedJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                      selectedJob?.id === job.id
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
                            {getJobTypeDisplay(job.jobType)}
                          </Badge>
                        </div>
                        <Link
                          to={`/companies/${job.companyId}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {job.company.name}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-1 justify-between">
                          <span>
                            {job.skills.split(",").map((skill, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill.trim()}
                              </Badge>
                            ))}
                          </span>
                          <span className="text-muted-foreground text-xs content-center">
                            {job.statusDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredAndSortedJobs.length === 0 && (
                  <div className="flex items-center justify-center p-4">
                    <span className="text-muted-foreground">No jobs found</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card
          className={`sm:w-2/3 flex flex-col 
            ${window.innerWidth < 640 && !selectedJob ? "hidden" : ""}`}
        >
          <CardHeader className="flex-row justify-between items-center">
            <CardTitle>Job Details</CardTitle>
            {selectedJob && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {status === "closed" && (
                    <PosterGenerater
                      companyName={selectedJob.company.name}
                      jobTitle={selectedJob.role}
                      list={applications?.map((app) => {
                        console.log(app);
                        return {
                          name: app.user.name,
                          usn: app.user.uid,
                          userimg: app.user.profileImageUrl,
                        };
                      })}
                    />
                  )}
                  <DropdownMenuItem onSelect={() => saveAsExcel(applications)}>
                    Download Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {selectedJob ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1">
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
                    <Badge
                      variant="outline"
                      className={`${
                        jobTypeConfig[selectedJob.jobType]?.color
                      } capitalize`}
                    >
                      {getJobTypeDisplay(selectedJob.jobType)}
                    </Badge>
                  </div>

                  <div>
                    {applications ? (
                      applications.length === 0 ? (
                        <p className="text-muted-foreground">
                          No applications found.
                        </p>
                      ) : (
                        <TableSelecter
                          applications={applications}
                          acceptFn={handleAcceptUsers}
                          rejectFn={handleRejectUsers}
                        />
                      )
                    ) : (
                      <LoaderPinwheel className="w-6 h-6 animate-spin" />
                    )}
                  </div>

                  {/* <div className="mb-4">
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

                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedJob.description}
                    </pre>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Deadline</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedJob.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Status</h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {selectedJob.status}
                      </Badge>
                    </div>
                  </div> */}
                </div>
                <div className="flex gap-2 mt-auto justify-center">
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(`/jobs/${selectedJob.jobId}`, "_blank")
                    }
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(selectedJob)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setJobToDelete(selectedJob);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  {jobStatus[status].nextStatus && (
                    <Button
                      variant={jobStatus[status].buttonVariant}
                      size="sm"
                      onClick={() => handleBackendStatusChange(selectedJob)}
                    >
                      <icon.icon className="h-4 w-4 mr-2" />
                      {jobStatus[status].title}
                    </Button>
                  )}
                  {!jobStatus[status].nextStatus && (
                    <Button variant={jobStatus[status].buttonVariant} size="sm">
                      <icon.icon className="h-4 w-4 mr-2" />
                      {jobStatus[status].title}
                    </Button>
                  )}

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobManagement;
