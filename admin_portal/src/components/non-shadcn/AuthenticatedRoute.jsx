import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
export default function AuthenticatedRoutes() {
  const { currentUser } = useSelector((state) => state.user);
  return currentUser.verified ? (
    <Outlet />
  ) : (
    <div className="text-center flex-1 flex items-center justify-center">
      You are not yet verified by your department admin
    </div>
  );
}
