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
import { ExternalLink, Eye, Filter, MoreVertical, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [status, setStatus] = useState("open"); //application status
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  // const [isMobileJobDetailView, setIsMobileJobDetailView] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/jobs/myjobs`);
        const data = await response.json();
        console.log(data);
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
    result.sort((a, b) => {
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
      label: "Full-Time & Internship",
    },
  };

  const getJobTypeDisplay = (jobType) => {
    return jobTypeConfig[jobType]?.label || jobType;
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    if (window.innerWidth < 640) {
      navigate(`/jobs/${job.jobId}`);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 h-screen p-4 overflow-hidden">
      <div className="flex h-full gap-4 relative">
        {/* Job List */}
        <Card className="sm:w-1/3 flex flex-col overflow-hidden ">
          {/* <CardHeader className="flex-shrink-0 flex-row items-center space-x-4">
            <span className="font-semibold">Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="oa">Online Assessment</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader> */}

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
                  <DropdownMenuItem
                    onSelect={() => console.log("Generate Poster")}
                  >
                    Generate Poster
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => console.log("Download Excel")}
                  >
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
                  </div>
                </div>
                <div className="flex gap-2 mt-auto justify-center ">
                  <Button
                    variant="outline"
                    className="bg-green-500 text-gray-900 hover:bg-green-600 hover:text-black"
                    size="sm"
                    onClick={() =>
                      // window.open(`/jobs/${selectedJob.jobId}`, "_blank")
                      fetch(`/api/jobs/${selectedJob.jobId}/apply`)
                        .then((response) => response.json())
                        .then((data) => {
                          if (data.success) {
                            // window.open(data.data, "_blank");
                            console.log(data.data);
                            toast({
                              title: "Success",
                              description: "Applied for job successfully",
                              variant: "success",
                            });
                          } else {
                            toast({
                              title: "Error",
                              description: data.message,
                              variant: "destructive",
                            });
                          }
                        })
                        .catch((error) => {
                          console.error("Error applying for job:", error);
                          toast({
                            title: "Error",
                            description: "Failed to apply for job",
                            variant: "destructive",
                          });
                        })
                    }
                  >
                    {/* <Eye className="h-4 w-4 mr-2" /> */}
                    Apply Job
                  </Button>
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
    </div>
  );
};

export default JobManagement;
