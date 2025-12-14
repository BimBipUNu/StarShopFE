// src/admin/AdminRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: number;
  role: string;
  exp: number;
}

const AdminRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  let redirectPath: string | null = null;
  let shouldRender = false;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = new Date().getTime() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      redirectPath = "/auth/login";
    } else if (decoded.role !== "admin" && decoded.role !== "staff") {
      redirectPath = "/";
    } else {
      shouldRender = true;
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    localStorage.removeItem("token");
    redirectPath = "/auth/login";
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (shouldRender) {
    return <Outlet />;
  }

  return null;
};

export default AdminRoute;
