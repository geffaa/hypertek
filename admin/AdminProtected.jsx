import { useEffect } from "react";

export default function AdminProtected({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token) {
      window.location.href = "http://localhost:5173/signin"; // user login
    } else if (role !== "admin") {
      window.location.href = "http://localhost:5173/dashboard"; // user dashboard
    }
  }, [token, role]);

  if (!token || role !== "admin") return null; // wait for redirect

  return children;
}
