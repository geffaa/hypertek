import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This page is deprecated — collection creation was moved to /dashboard/add-user-collection
// which uses the correct /nft/parent-collection/create endpoint with category support.
function CreateCollections() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard/add-user-collection", { replace: true });
  }, [navigate]);
  return null;
}

export default CreateCollections;
