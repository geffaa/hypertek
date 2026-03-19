import { Navigate } from "react-router-dom";
// Legacy page — superseded by Marketplace > General tab + /collections/land
export default function Land() {
  return <Navigate to="/collections/land" replace />;
}
