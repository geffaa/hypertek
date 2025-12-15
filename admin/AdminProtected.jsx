import { useEffect } from "react";

export default function AdminProtected({ children }) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      window.location.replace("http://localhost:5173/signin");
    } else if (role !== "admin") {
      window.location.replace("http://localhost:5173/dashboard");
    }
  }, []);

  return children;
}
