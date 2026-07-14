import { Navigate, Outlet } from "react-router-dom";
// import EmployeeRoutes from "./PublicRoutes";

const EmployeeRoutes = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Outlet />;
  }

  // 👇 redirect based on role
  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === "employee") {
    return <Navigate to="/layout/desboards" replace />;
  }

  return <Outlet />;
};

export default EmployeeRoutes;