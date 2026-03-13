import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/signin" />;
  if (role === "admin") {
    const adminUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5174";
    window.location.href = adminUrl;
    return null;
  }
  if (role !== "user") return <Navigate to="/signin" />;

  return children;
}
