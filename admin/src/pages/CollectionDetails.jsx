import React from "react";
import { useNavigate } from "react-router-dom";
function CollectionDetails() {
  const navigate = useNavigate();

  // Helper function to add /admin prefix
  const withAdmin = (path) => `/admin${path}`;

  const handlePublish = () => {
    navigate(withAdmin("/collections"));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-white overflow-hidden pt-16 pb-4">

      <div className="flex-1 flex items-center justify-center">
        <div
          className="z-10"
          style={{
            width: "495px",
            display: "flex",
            flexDirection: "column",
            gap: "42px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h1
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "25px",
                margin: 0,
              }}
            >
              Collection Details
            </h1>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: "18px",
                color: "#FFFFFFAB",
                margin: 0,
              }}
            >
              Create your own collection.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {["Name", "URL", "Twitter", "Discord"].map((label) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: "18px",
                  }}
                >
                  {label}
                </label>
                <input
                  placeholder={`Add ${label}`}
                  className="transition-all duration-200 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                  style={{
                    width: "430px",
                    height: "48px",
                    borderRadius: "4px",
                    border: "1px solid #555",
                    padding: "13px 15px",
                    color: "white",
                    background: "transparent",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full flex justify-end pt-8 mb-12 z-10">
        <button
          onClick={handlePublish}
          className="mx-8 transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25"
          style={{
            width: "190px",
            height: "42px",
            borderRadius: "6px",
            padding: "10px",
            background: "#002AA8",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Publish
        </button>
      </div>
    </div>
  );
}

export default CollectionDetails;