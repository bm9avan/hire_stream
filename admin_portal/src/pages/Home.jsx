import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      <header className="flex items-center justify-between p-6">
        <div className="text-2xl font-bold">Hire Stream</div>
        <div className="flex items-center space-x-4">
          {/* <ModeToggle /> */}
          <Button
            onClick={() => navigate("/sign-in")}
            className="bg-white text-indigo-500 hover:bg-gray-200"
          >
            Sign In
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Your Career, <span className="text-yellow-300">Streamlined</span>.
          </h1>
          <p className="mt-4 text-lg">
            Explore jobs, connect with top companies, and prepare for a bright
            future.
          </p>
          <Button
            onClick={() => navigate("/sign-up")}
            className="mt-6 px-6 py-3 bg-yellow-300 text-black hover:bg-yellow-400"
          >
            Get Started
          </Button>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <Card className="bg-white text-black hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-col items-center text-center">
              <CardTitle className="text-xl font-semibold">
                Browse Jobs
              </CardTitle>
              <CardDescription>
                Find your dream job in top companies.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button className="mt-4 bg-indigo-500 text-white hover:bg-indigo-600">
                Explore
              </Button>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="bg-white text-black hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-col items-center text-center">
              <CardTitle className="text-xl font-semibold">
                Prepare for Interviews
              </CardTitle>
              <CardDescription>
                Mock interviews and interview experiences.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button className="mt-4 bg-purple-500 text-white hover:bg-purple-600">
                Learn More
              </Button>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="bg-white text-black hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-col items-center text-center">
              <CardTitle className="text-xl font-semibold">
                Connect with Alumni
              </CardTitle>
              <CardDescription>
                Get guidance from experienced alumni.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button className="mt-4 bg-pink-500 text-white hover:bg-pink-600">
                Start Now
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Additional Features Section */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold">Why Choose Hire Stream?</h2>
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div
              className="p-6 rounded-lg shadow-lg"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 className="text-xl font-bold">Personalized Job Matches</h3>
              <p>Discover opportunities tailored to your profile.</p>
            </div>
            <div
              className="p-6 rounded-lg shadow-lg"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(50px)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 className="text-xl font-bold">Real-Time Updates</h3>
              <p>Stay updated with the latest jobs and notifications.</p>
            </div>
            <div
              className="p-6 rounded-lg shadow-lg"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(50px)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 className="text-xl font-bold">Resume Generator</h3>
              <p>Create a stunning resume in minutes.</p>
            </div>
            <div
              className="p-6 rounded-lg shadow-lg"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(50px)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 className="text-xl font-bold">Webinars and Guidance</h3>
              <p>Attend sessions by alumni to boost your prep.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 bg-black text-white p-6 text-center">
        <p>&copy; 2024 Hire Stream. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
