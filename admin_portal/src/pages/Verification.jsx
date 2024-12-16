import React, { useEffect, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { set } from "react-hook-form";

const Verification = ({ verify }) => {
  console.log("verify", verify);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(["name", "email", "branch", "role", "verified", "actions"])
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      console.log(`/api/user/verif${verify ? "y" : "ed"}List`);
      const res = await fetch(`/api/user/verif${verify ? "y" : "ed"}List`);
      const data = await res.json();
      console.log("its data", data, res);
      setRequests(data);
      setLoading(false);
      setFilteredRequests(data);
    };
    fetchRequests();
  }, [verify]);

  useEffect(() => {
    const filtered = requests.filter(
      (request) =>
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [searchTerm, requests]);
  console.log(requests);
  const handleVerify = async (id) => {
    try {
      const res = await fetch(`/api/user/verify/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verified: true }),
      });
      console.log(res);
      const data = await res.json();
      console.log(data);
      setRequests(
        requests.map((req) =>
          req.uid === id ? { ...req, verified: true } : req
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async (id) => {
    try {
      await fetch(`/api/user/verify/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verified: false }),
      });
      setRequests(
        requests.map((req) =>
          req.uid === id ? { ...req, verified: false } : req
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const sortData = (key) => {
    let direction;
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredRequests].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredRequests(sorted);
  };

  const toggleColumnVisibility = (columnId) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  const pageCount = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading)
    return (
      <div className="flex flex-1 justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );

  if (requests.length === 0)
    return (
      <div className="flex flex-1 justify-center items-center">
        <h1 className="text-2xl font-bold">No requests found</h1>
      </div>
    );
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["name", "email", "branch", "role", "verified", "actions"].map(
              (column) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  className="capitalize"
                  checked={visibleColumns.has(column)}
                  onCheckedChange={() => toggleColumnVisibility(column)}
                >
                  {column}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.has("name") && (
                <TableHead className="text-center">
                  <Button variant="ghost" onClick={() => sortData("name")}>
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.has("email") && (
                <TableHead className="text-center">
                  <Button variant="ghost" onClick={() => sortData("email")}>
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.has("branch") && (
                <TableHead className="text-center">Branch</TableHead>
              )}
              {visibleColumns.has("role") && (
                <TableHead className="text-center">Role</TableHead>
              )}
              {visibleColumns.has("verified") && (
                <TableHead className="text-center">Verified</TableHead>
              )}
              {visibleColumns.has("actions") && (
                <TableHead className="text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.map((request) => (
              <TableRow key={request.uid}>
                {visibleColumns.has("name") && (
                  <TableCell className="text-center font-medium">
                    {request.name}
                  </TableCell>
                )}
                {visibleColumns.has("email") && (
                  <TableCell className="text-center">{request.email}</TableCell>
                )}
                {visibleColumns.has("branch") && (
                  <TableCell className="text-center">
                    {request.branchId}
                  </TableCell>
                )}
                {visibleColumns.has("role") && (
                  <TableCell className="text-center">{request.role}</TableCell>
                )}
                {visibleColumns.has("verified") && (
                  <TableCell className="text-center">
                    {request.verified ? "Verified" : "Unverified"}
                  </TableCell>
                )}
                {visibleColumns.has("actions") && (
                  <TableCell className="text-center">
                    {!request.verified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(request.uid)}
                        disabled={request.verified}
                        className="mr-2"
                      >
                        Verify
                      </Button>
                    )}
                    {request.verified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(request.uid)}
                        disabled={!request.verified}
                      >
                        Reject
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {paginatedRequests.length} of {filteredRequests.length}{" "}
          results
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, pageCount))
            }
            disabled={currentPage === pageCount}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Verification;
