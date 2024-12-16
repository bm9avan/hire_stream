import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
export default function AdminRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const userRole = currentUser.role;
  const isAuthorized = userRole === "admin" || userRole === "placement-staff";
  return isAuthorized ? (
    <Outlet />
  ) : (
    <div className="text-center flex-1 flex items-center justify-center">
      You don't have the necessary permissions to create a company or job
      posting. Please contact the placement administrator.
    </div>
  );
}
