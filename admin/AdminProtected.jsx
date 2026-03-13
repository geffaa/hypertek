import { useEffect } from "react";

export default function AdminProtected({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

  useEffect(() => {
    if (!token) {
      window.location.href = `${frontendUrl}/signin`;
    } else if (role !== "admin") {
      window.location.href = `${frontendUrl}/dashboard`;
    }
  }, [token, role]);

  if (!token || role !== "admin") return null;

  return children;
}
