import React, { useEffect, useState } from "react";
import Collectionimage from "../assets/CreateCollection/collection.png";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Image_Base_Url } from "../Config";
import {Dashboard_Base_Url} from "../Config";

function UserDetails() {
  const [activeTab, setActiveTab] = useState("details");
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state; // user object passed from previous page

  const handleBackButton = () => {
    navigate("/users");
  };

  // ==========================
  // Fetch user collections (NO TOKEN)
  // ==========================
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserCollections = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${Dashboard_Base_Url}/v1/nft/user/collection/get/${user.id}`
        );

        setCollections(res.data.collection || []);
        console.log("Fetched collections:", res.data);
      } catch (err) {
        console.error("Error fetching collections", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCollections();
  }, [user]);

  return (
    <div className="bg-black min-h-screen flex flex-col relative">
      {/* BG Effects */}
      <div
        className="absolute rounded-full"
        style={{
          top: "150px",
          left: "320px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "500px",
          left: "900px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
      />

      <div className="m-12 flex-1">
        {/* Tabs */}
        <div className="flex gap-[101px]">
          <button
            onClick={() => setActiveTab("details")}
            className={`font-semibold text-[20px] pb-2 ${
              activeTab === "details"
                ? "text-white border-b-2 border-white"
                : "text-white/70"
            }`}
          >
            User Details
          </button>

          <button
            onClick={() => setActiveTab("collections")}
            className={`font-semibold text-[20px] pb-2 ${
              activeTab === "collections"
                ? "text-white border-b-2 border-white"
                : "text-white/70"
            }`}
          >
            User Collections
          </button>
        </div>

        {/* ==========================
            USER DETAILS TAB
        ========================== */}
        {activeTab === "details" && (
          <div className="mt-12 px-5 flex flex-col gap-6">
            <img
              src={
                user?.avatar
                  ? `${Image_Base_Url}${user.avatar}`
                  : Collectionimage
              }
              alt={user?.name}
              className="w-[117px] h-[122px] rounded-full object-cover"
            />

            <div className="flex gap-12 text-white">
              <div>
                <h1 className="font-semibold">Name:</h1>
                <p>{user?.name || "-"}</p>
              </div>

              <div>
                <h1 className="font-semibold">Email:</h1>
                <p>{user?.email || "No Email"}</p>
              </div>

              <div>
                <h1 className="font-semibold">UID:</h1>
                <p>{user?.id || "-"}</p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================
            USER COLLECTIONS TAB
        ========================== */}
        {activeTab === "collections" && (
          <div className="mt-12">
            {loading && <p className="text-white">Loading collections...</p>}

            {!loading && collections.length === 0 && (
              <p className="text-white">No collections found</p>
            )}

            <div className="flex flex-wrap gap-8">
              {collections.map((col) => (
                <div
                  key={col._id}
                  className="w-[420px] h-[178px] flex items-center gap-4 p-5 rounded-[6px] border border-white/20"
                >
                  <img
                    src={
                      col.collection?.image
                        ? `${Image_Base_Url}${col.collection.image}`
                        : Collectionimage
                    }
                    alt={col.collection?.name}
                    className="w-[117px] h-[122px] rounded-full object-cover"
                  />

                  <div className="text-white space-y-2">
                    <div>
                      <span className="font-semibold">Collection:</span>{" "}
                      {col.collection?.name}
                    </div>

                    <div>
                      <span className="font-semibold">Owner:</span>{" "}
                      {col.collection?.owner?.slice(0, 6)}...
                      {col.collection?.owner?.slice(-4)}
                    </div>

                    <div>
                      <span className="font-semibold">Supply:</span>{" "}
                      {col.collection?.supply}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="ml-12 pb-20">
        <button
          onClick={handleBackButton}
          className="w-[190px] h-[42px] rounded bg-[#002AA8] text-white"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default UserDetails;
