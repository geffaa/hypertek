import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This page is deprecated — replaced by /dashboard/collections (Nfts.jsx)
function CollectionDetails() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard/collections", { replace: true });
  }, [navigate]);
  return null;
}

export default CollectionDetails;
