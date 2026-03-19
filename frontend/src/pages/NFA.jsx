import { Navigate } from "react-router-dom";
// Legacy page — superseded by Marketplace > General tab + /collections/characters
export default function NFA() {
  return <Navigate to="/collections/characters" replace />;
}
