import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthenticatedRoutes from "./components/non-shadcn/AuthenticatedRoute";
import ScrollToTop from "./components/non-shadcn/ScrollToTop";
import Account from "./pages/Account";
import Companies from "./pages/Companies";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import User from "./pages/User";
import { Toaster } from "./components/ui/toaster";
import Interview from "./components/non-shadcn/mockInterview/Interview";
import { createContext, useState } from "react";
import StartInterview from "./components/non-shadcn/mockInterview/StartInterview";
import Company from "./pages/Company";

export const WebCamContext = createContext();
export default function App() {
  const { currentUser: user } = useSelector((state) => state.user);
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  return (
    <WebCamContext.Provider value={{ webCamEnabled, setWebCamEnabled }}>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster />
        <Routes>
          {user ? (
            <Route element={<Dashboard user={user} />}>
              {/* AuthenticatedRoutes */}
              <Route
                path="/"
                element={
                  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 p-4 transition-colors duration-300">
                    <div className="text-center bg-white dark:bg-gray-700 shadow-2xl dark:shadow-xl rounded-xl p-12 transform transition duration-500 hover:scale-105">
                      <h1 className="text-5xl font-bold tracking-tight mb-4 text-blue-800 dark:text-blue-300 drop-shadow-md">
                        Hi, {user.name}
                      </h1>
                      <p className="text-xl font-medium text-gray-600 dark:text-gray-300 opacity-90 animate-pulse">
                        Welcome to Hire Stream Student Portal
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
              <Route element={<AuthenticatedRoutes />}>
                <Route path="/jobs" element={<Jobs />}>
                  <Route path=":jobId" element={<div>Job Details</div>} />
                </Route>
                <Route path="applications" element={<Jobs mode="applied" />}>
                  <Route path=":jobId" element={<div>Job Details</div>} />
                </Route>
                <Route
                  path="/assessments"
                  element={<Jobs mode="online-assessment" />}
                >
                  <Route path=":jobId" element={<div>Job Details</div>} />
                </Route>
                <Route path="/interviews" element={<Jobs mode="interview" />}>
                  <Route path=":jobId" element={<div>Job Details</div>} />
                </Route>
                <Route path="/selected" element={<Jobs mode="selected" />}>
                  <Route path=":jobId" element={<div>Job Details</div>} />
                </Route>
                <Route path="/rejected" element={<Jobs mode="rejected" />}>
                  <Route path=":jobId" element={<div>Job Details</div>} />
                </Route>
                <Route path="companies" element={<Companies />}></Route>
                <Route path="/companies/:companyId" element={<Company />} />
                <Route path="mockinterview" element={<Jobs mode="mock" />} />
                <Route path="/mockinterview/:mockId" element={<Interview />} />
                <Route
                  path="/mockinterview/:mockId/start"
                  element={<StartInterview />}
                />
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
        </Routes>
      </BrowserRouter>
    </WebCamContext.Provider>
  );
}
