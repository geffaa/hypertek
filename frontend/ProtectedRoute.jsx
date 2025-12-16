import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/signin" />; // not logged in
  if (role === "admin") return <Navigate to="http://localhost:5174" />; 
  if (role !== "user") return <Navigate to="/signin" />; // invalid role

  return children;
}
