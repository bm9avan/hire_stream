import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Forms = () => {
  return (
    <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Manage Data</CardTitle>
          <CardDescription>
            Add new jobs and companies to the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="company" className="block">
              <Button
                variant="outline"
                className="w-full h-32 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5"
              >
                <Building2 className="h-8 w-8" />
                <span className="font-medium">Add Companies</span>
                <span className="text-sm text-muted-foreground">
                  Register new companies
                </span>
              </Button>
            </Link>

            <Link to="job" className="block">
              <Button
                variant="outline"
                className="w-full h-32 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5"
              >
                <Briefcase className="h-8 w-8" />
                <span className="font-medium">Add Jobs</span>
                <span className="text-sm text-muted-foreground">
                  Create new job listings
                </span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forms;
