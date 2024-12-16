import OAuth from "@/components/non-shadcn/OAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuth from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function SignUp() {
  const [formData, setFormData] = useState({});
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const { handelSignUp } = useAuth();
  const { loading, error: errorMessage } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collegeRes, branchRes] = await Promise.all([
          fetch("/api/colleges"),
          fetch("/api/branches"),
        ]);
        const collegeData = await collegeRes.json();
        const branchData = await branchRes.json();
        setColleges(collegeData);
        setBranches(branchData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]:
        e.target.id === "uid"
          ? e.target.value.trim().toUpperCase()
          : e.target.value.trim(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handelSignUp({
      uid:
        formData.name.toLowerCase().split(" ").join("") +
        Math.random().toString(9).slice(-4),
      ...formData,
    });
  };

  return (
    <div className="flex min-h-min md:h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto w-full max-w-4xl p-8 lg:p-12">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Sign Up</CardTitle>
          {/* <OAuth /> */}
          <CardDescription className="text-lg">
            Create an account to start using Hire Stream.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="uid">USN</Label>
                <Input
                  id="uid"
                  type="text"
                  placeholder="USN"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNo">Phone Number</Label>
                <Input
                  id="phoneNo"
                  type="number"
                  min={1000000000}
                  max={9999999999}
                  placeholder="Phone Number"
                  onChange={handleChange}
                  required
                />
                <div className="grid gap-2">
                  <Label htmlFor="batch">Batch(Passout year)</Label>
                  <Input
                    id="batch"
                    type="number"
                    min={2000}
                    max={2100}
                    placeholder="Batch (e.g., 2024)"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid gap-2 space-y-">
                <Label htmlFor="cgpa">CGPA</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="CGPA"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dob">Date of Birth (mm-dd-yyyy)</Label>
                <Input id="dob" type="date" onChange={handleChange} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="collegeId">College</Label>
                <select
                  id="collegeId"
                  className="w-full p-2 border rounded-xl bg-background text-foreground"
                  onChange={handleChange}
                  required
                >
                  <option value="" className="bg-background text-foreground">
                    Select College
                  </option>
                  {colleges.map((college) => (
                    <option
                      key={college.collegeId}
                      value={college.collegeId}
                      className="bg-background text-foreground "
                    >
                      {college.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branchId">Branch</Label>
                <select
                  id="branchId"
                  className="w-full p-2 border rounded-xl bg-background text-foreground"
                  onChange={handleChange}
                >
                  <option value="" className="bg-background text-foreground">
                    Select Branch
                  </option>
                  {branches.map((branch) => (
                    <option
                      key={branch.branchId}
                      value={branch.branchId}
                      className="bg-background text-foreground"
                    >
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>
            </div>
            {errorMessage && (
              <div
                className={`col-span-full mt-5 ${
                  errorMessage.includes("successful")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {errorMessage}
              </div>
            )}
            <div className="col-span-full">
              <Button type="submit" className="w-full">
                {loading && <Loader2 className="animate-spin mr-2" />}
                Sign Up
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm col-span-full">
            Already have an account?{" "}
            <Link to="/sign-in" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUp;
