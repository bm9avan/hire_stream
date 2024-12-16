import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "../ui/badge";

const statusConfig = {
  applied: {
    color: "bg-gray-100 text-gray-800",
    label: "Applied",
  },
  "online-assessment": {
    color: "bg-yellow-100 text-yellow-800",
    label: "Online Assessment",
  },
  interview: {
    color: "bg-blue-100 text-blue-800",
    label: "Interview",
  },
  selected: {
    color: "bg-green-100 text-green-800",
    label: "Selected",
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    label: "Rejected",
  },
};

const getStatusTypeDisplay = (status) => {
  return statusConfig[status]?.label || status;
};

const TableSelecter = ({ applications, acceptFn, rejectFn }) => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUids, setSelectedUids] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Derive unique values for dropdowns
  const uniqueBranches = useMemo(
    () => [...new Set(applications.map((app) => app.user.branchId))],
    [applications]
  );

  const uniqueStatuses = useMemo(
    () => [...new Set(applications.map((app) => app.currentStatus))],
    [applications]
  );

  // Handling search and filtering
  const filteredAndSortedApplications = useMemo(() => {
    return applications
      .filter(
        (app) =>
          (searchTerm === "" ||
            app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.uid.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (branchFilter === "" || app.user.branchId === branchFilter) &&
          (statusFilter === "" || app.currentStatus === statusFilter)
      )
      .sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key] || a.user[sortConfig.key];
        const bValue = b[sortConfig.key] || b.user[sortConfig.key];

        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
  }, [applications, searchTerm, branchFilter, statusFilter, sortConfig]);

  // Checkbox selection handlers
  const handleSelectAll = (checked) => {
    setSelectedUids(
      checked ? filteredAndSortedApplications.map((app) => app.uid) : []
    );
  };

  const handleIndividualSelect = (uid, checked) => {
    setSelectedUids((prev) =>
      checked ? [...prev, uid] : prev.filter((id) => id !== uid)
    );
  };

  // Manual UID input handler
  const handleManualUidInput = (inputValue) => {
    const uidsToSelect = inputValue
      .toUpperCase()
      .split(",")
      .map((uid) => uid.trim())
      .filter((uid) => applications.some((app) => app.uid === uid));

    setSelectedUids(uidsToSelect);
  };

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Job Applications</CardTitle>
        <div className="flex gap-4">
          <Button onClick={() => acceptFn(selectedUids)}>
            Accept Selected
          </Button>
          <Button
            onClick={() => rejectFn(selectedUids)}
            className="bg-red-500 hover:bg-red-600"
          >
            Reject Selected
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search by name or USN"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Branch" />
            </SelectTrigger>
            <SelectContent>
              {uniqueBranches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={
                    filteredAndSortedApplications.length > 0 &&
                    selectedUids.length === filteredAndSortedApplications.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Name
                {sortConfig.key === "name" &&
                  (sortConfig.direction === "asc" ? (
                    <ArrowUp className="inline h-4 w-4 ml-2" />
                  ) : (
                    <ArrowDown className="inline h-4 w-4 ml-2" />
                  ))}
              </TableHead>
              <TableHead
                onClick={() => handleSort("uid")}
                className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                USN
                {sortConfig.key === "uid" &&
                  (sortConfig.direction === "asc" ? (
                    <ArrowUp className="inline h-4 w-4 ml-2" />
                  ) : (
                    <ArrowDown className="inline h-4 w-4 ml-2" />
                  ))}
              </TableHead>
              <TableHead className="text-center">Branch ID</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedApplications.map((app) => (
              <TableRow key={app.uid}>
                <TableCell>
                  <Checkbox
                    checked={selectedUids.includes(app.uid)}
                    onCheckedChange={(checked) =>
                      handleIndividualSelect(app.uid, checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-left">{app.user.name}</TableCell>
                <TableCell className="text-center">
                  <Link
                    to={`/user/${app.uid}`}
                    className="text-blue-600 hover:underline"
                  >
                    {app.uid}
                  </Link>
                </TableCell>
                <TableCell className="text-center">
                  {app.user.branchId}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={`${
                      statusConfig[app.currentStatus]?.color
                    } capitalize`}
                  >
                    {getStatusTypeDisplay(app.currentStatus)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Selected UIDs Input */}
        <div className="mt-4">
          <Input
            placeholder="Selected UIDs (comma-separated)"
            value={selectedUids.join(", ")}
            onChange={(e) => handleManualUidInput(e.target.value)}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TableSelecter;
