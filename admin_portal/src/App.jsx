import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/non-shadcn/AdminRoute";
import AuthenticatedRoutes from "./components/non-shadcn/AuthenticatedRoute";
import ScrollToTop from "./components/non-shadcn/ScrollToTop";
import Account from "./pages/Account";
import Companies from "./pages/Companies";
import Dashboard from "./pages/Dashboard";
import Forms from "./pages/Forms";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import PostCompany from "./pages/PostCompany";
import PostJob from "./pages/PostJob";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import User from "./pages/User";
import Verification from "./pages/Verification";
import Company from "./pages/Company";
import Upload from "./pages/UploadData";

export default function App() {
  const { currentUser: user } = useSelector((state) => state.user);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {user ? (
          <Route element={<Dashboard user={user} />}>
            <Route
              path="/"
              element={
                <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 p-4 transition-colors duration-300">
                  <div className="text-center bg-white dark:bg-gray-700 shadow-2xl dark:shadow-xl rounded-xl p-12 transform transition duration-500 hover:scale-105">
                    <h1 className="text-5xl font-bold tracking-tight mb-4 text-blue-800 dark:text-blue-300 drop-shadow-md">
                      Hi, {user.name}
                    </h1>
                    <p className="text-xl font-medium text-gray-600 dark:text-gray-300 opacity-90 animate-pulse">
                      Welcome to Hire Stream Admin Portal
                    </p>
                  </div>
                  <div className="absolute bottom-10 opacity-50 dark:opacity-40">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100"
                      height="50"
                      viewBox="0 0 100 50"
                      className="animate-bounce"
                    >
                      <path
                        d="M10 15 L50 40 L90 15"
                        fill="none"
                        stroke="#1E40AF"
                        className="dark:stroke-blue-500"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              }
            ></Route>
            {/* AuthenticatedRoutes */}
            <Route element={<AuthenticatedRoutes />}>
              <Route path="jobs" element={<Jobs />}>
                <Route path=":jobId" element={<div>Job Details</div>} />
              </Route>
              <Route
                path="companies"
                element={<Companies userRole={user.role} />}
              >
              </Route>
                <Route path="/companies/:companyId" element={<Company />} />

              <Route path="forms" element={<AdminRoute />}>
                <Route path="" element={<Forms />} />
                <Route path="company" element={<PostCompany />} />
                <Route path="job" element={<PostJob user={user} />} />
              </Route>
              <Route path="/verify" element={<Verification verify={true} />} />
              {/* need to make true verification status */}
              <Route path="/team" element={<Verification verify={false} />} />
              <Route path="/upload" element={<Upload />} />
            </Route>
            <Route
              path="/user"
              element={
                <div className="grid gap-4 md:grid-cols-3">
                  {/* {users.map((user) => (
                    <UserCard key={user.uid} user={user} />
                  ))} */}
                  users
                </div>
              }
            />
            <Route path="/user/:userId" element={<User user={user} />} />
            <Route path="/account" element={<Account />} />
          </Route>
        ) : (
          <Route path="/" element={<Home />} />
        )}
        <Route
          path="/sign-in"
          element={user ? <Navigate to="/" /> : <SignIn />}
        />
        <Route
          path="/sign-up"
          element={user ? <Navigate to="/" /> : <SignUp />}
        />
        {/* <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}
