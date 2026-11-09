
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "../Context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F8FD]">
        <p className="text-[#299BCF] font-medium">
          Checking your session...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "patient") {
      return <Navigate to="/patients" replace />;
    }

    if (user.role === "doctor") {
      return <Navigate to="/doctors" replace />;
    }

    if (user.role === "receptionist") {
      return <Navigate to="/receptionist" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
