import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Edit, Eye, Loader, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { editActions } from "../redux/edit/editSlice";

const Companies = ({ userRole }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  const isAuthorized = userRole === "admin" || userRole === "placement-staff";

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      if (!response.ok) throw new Error("Failed to fetch companies");
      const data = await response.json();
      setCompanies(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (company) => {
    dispatch(editActions.startEditingCompany(company));
    navigate("/forms/company");
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;

    try {
      const response = await fetch(
        `/api/companies/${companyToDelete.companyId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete company");

      setCompanies((prev) =>
        prev.filter((c) => c.companyId !== companyToDelete.companyId)
      );
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                <div>
                  <CardTitle>Companies</CardTitle>
                  <CardDescription>
                    List of all registered companies
                  </CardDescription>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search companies..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((company) => (
                <Card key={company.companyId} className="overflow-hidden">
                  <CardHeader className="p-4">
                    {/* <div className="flex-1 flex items-center"> */}
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        className="object-cover rounded-xl"
                      />
                    ) : (
                      <div className="h-8 w-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {/* </div> */}
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* <div className="flex items-start gap-4"> */}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg truncate">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {company.description}
                      </p>
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/companies/${company.companyId}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {isAuthorized && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(company)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-gray-100 hover:text-white"
                              onClick={() => {
                                setCompanyToDelete(company);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                      {/* </div> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredCompanies.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No companies found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{" "}
                {companyToDelete?.name} and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Companies;
