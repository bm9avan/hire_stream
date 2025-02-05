import React, { useState, useMemo, useEffect } from "react";
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
import { ArrowUp, ArrowDown, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";

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

const TableSelecter = ({
  applications,
  acceptFn,
  rejectFn,
  updateSelectedFn,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUids, setSelectedUids] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    console.log("inside useEffect", selectedUids);
    updateSelectedFn(selectedUids);
  }, [selectedUids]);

  const uniqueBranches = useMemo(
    () => [...new Set(applications.map((app) => app.user.branchId))],
    [applications]
  );

  const uniqueStatuses = useMemo(
    () => [...new Set(applications.map((app) => app.currentStatus))],
    [applications]
  );

  const filteredAndSortedApplications = useMemo(() => {
    return applications
      .filter(
        (app) =>
          (searchTerm === "" ||
            app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.uid.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (branchFilter === "all" || app.user.branchId === branchFilter) && // Updated condition
          (statusFilter === "all" || app.currentStatus === statusFilter) // Updated condition
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

  const handleSelectAll = (checked) => {
    if (!isProcessing) {
      setSelectedUids(
        checked ? filteredAndSortedApplications.map((app) => app.uid) : []
      );
    }
  };

  const handleIndividualSelect = (uid, checked) => {
    if (!isProcessing) {
      setSelectedUids((prev) =>
        checked ? [...prev, uid] : prev.filter((id) => id !== uid)
      );
    }
  };

  const handleManualUidInput = (inputValue) => {
    if (!isProcessing) {
      const uidsToSelect = inputValue
        .toUpperCase()
        .split(",")
        .map((uid) => uid.trim())
        .filter((uid) => applications.some((app) => app.uid === uid));
      setSelectedUids(uidsToSelect);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleAccept = async () => {
    if (selectedUids.length === 0) return;
    setIsProcessing(true);
    await acceptFn(selectedUids);
    setSelectedUids([]);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (selectedUids.length === 0) return;
    setIsProcessing(true);
    await rejectFn(selectedUids);
    setSelectedUids([]);
    setIsProcessing(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isProcessing) {
      setDragActive(true);
    }
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const processExcelFile = async (file) => {
    if (isProcessing) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      const uids = jsonData
        .map((row) => row.USN || row.usn)
        .filter((uid) => uid && applications.some((app) => app.uid === uid));

      setSelectedUids(uids);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);

    if (!isProcessing) {
      const file = e.dataTransfer.files[0];
      if (file?.type.includes("spreadsheet") || file?.name.endsWith(".xlsx")) {
        await processExcelFile(file);
      }
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Job Applications</CardTitle>
        <div className="flex gap-4">
          <Button
            onClick={handleAccept}
            disabled={selectedUids.length === 0 || isProcessing}
          >
            {isProcessing ? "Processing..." : "Accept Selected"}
          </Button>
          <Button
            onClick={handleReject}
            className="bg-red-500 hover:bg-red-600"
            disabled={selectedUids.length === 0 || isProcessing}
          >
            {isProcessing ? "Processing..." : "Reject Selected"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search by name or USN"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Branch">
                {branchFilter === "all" ? "All Branches" : branchFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {uniqueBranches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status">
                {statusFilter === "all"
                  ? "All Statuses"
                  : getStatusTypeDisplay(statusFilter)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusTypeDisplay(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  className="rounded-s rounded-e"
                  checked={
                    filteredAndSortedApplications.length > 0 &&
                    selectedUids.length === filteredAndSortedApplications.length
                  }
                  onCheckedChange={handleSelectAll}
                  disabled={isProcessing}
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
              <TableRow
                key={app.uid}
                className={
                  isProcessing && selectedUids.includes(app.uid)
                    ? "opacity-50"
                    : ""
                }
              >
                <TableCell>
                  <Checkbox
                    className="rounded-s rounded-e"
                    checked={selectedUids.includes(app.uid)}
                    disabled={isProcessing}
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

        <div
          className={`mt-4 border-2 border-dashed p-4 text-center ${
            dragActive ? "border-primary bg-primary/10" : "border-gray-300"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Drag and drop Excel file with USN column or paste USNs below
          </p>
        </div>

        <div className="mt-4">
          <Input
            placeholder="Selected UIDs (comma-separated)"
            value={selectedUids.join(", ")}
            onChange={(e) => handleManualUidInput(e.target.value)}
            disabled={isProcessing}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TableSelecter;
