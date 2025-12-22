import React, { useState, useEffect } from "react";
import Collectionimage from "../assets/CreateCollection/collection.png";
import { useNavigate, useLocation } from "react-router-dom";
import { Image_Base_Url, Dashboard_Base_Url } from "../Config";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

function CollectionCard({ collection }) {
  return (
    <div
      className="w-[420px] h-auto flex items-center gap-4 p-5 rounded-[6px] border-[1px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] cursor-pointer"
      style={{
        borderImageSource:
          "linear-gradient(178.61deg, rgba(49, 47, 47, 0.56) 67.55%, rgba(151, 145, 145, 0.33) 98.82%)",
        borderImageSlice: 1,
      }}
    >
      <img
        src={collection.collection?.image ? `${Image_Base_Url}${collection.collection.image}` : Collectionimage}
        alt={collection.collection?.name || "Collection"}
        className="w-[117px] h-[122px] rounded-full object-cover"
      />
      <div className="flex flex-col gap-1 text-white">
        <p><strong>Name:</strong> {collection.collection.name}</p>
        <p><strong>ID:</strong> {collection._id}</p>
        <p><strong>Supply:</strong> {collection.collection.supply}</p>
        <p><strong>Chain:</strong> {collection.collection.chain}</p>
      </div>
    </div>
  );
}

function UserDetailsSection({ user }) {
  return (
    <div className="mt-12 px-5 flex flex-col gap-4 w-[502px]">
      {user.avatar && user.avatar !== "" ? (
        <img
          src={`${Image_Base_Url}${user.avatar}`}
          alt={user.name || "User"}
          className="w-[117px] h-[122px] mb-[5px] rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
      ) : null}

      <div
        className="w-[117px] h-[122px] mb-[5px] flex items-center justify-center rounded-full bg-gray-700 text-gray-400"
        style={{ display: user.avatar ? "none" : "flex" }}
      >
        <FaUserCircle className="w-full h-full p-4" />
      </div>

      <div className="w-[481px] h-[43px] flex items-center gap-[45px]">
        <div className="flex flex-col items-start justify-center gap-[2px] w-[56px]">
          <h1 className="font-inter font-semibold text-[18px]">Name:</h1>
          <p className="font-inter font-medium text-[14px]">{user.name}</p>
        </div>
        <div className="flex flex-col items-start justify-center gap-[2px] w-[160px]">
          <h1 className="font-inter font-semibold text-[18px]">Email:</h1>
          <p className="font-inter font-medium text-[14px]">{user.supply || "No Email"}</p>
        </div>
        <div className="flex flex-col items-start justify-center gap-[2px] w-[160px]">
          <h1 className="font-inter font-semibold text-[18px]">UID:</h1>
          <p className="font-inter font-medium text-[14px]">{user.id || "No UID"}</p>
        </div>
      </div>
    </div>
  );
}

function UserDetails() {
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [userCollections, setUserCollections] = useState([]);
  const [createdCollections, setCreatedCollections] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.userData;

  useEffect(() => {
    if (!user) navigate("/users");
  }, [user, navigate]);

  useEffect(() => {
    try {
      const adminData = localStorage.getItem("admin_data");
      if (adminData) setUserData(JSON.parse(adminData));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCollections = async () => {
      try {
        setLoading(true);
        const resUser = await axios.get(`${Dashboard_Base_Url}/v1/nft/user/collection/get/${user.id}`);
        setUserCollections(resUser.data.collection || []);
        const resCreated = await axios.get(`${Dashboard_Base_Url}/v1/nft/user/collection/created/${user.id}`);
        setCreatedCollections(resCreated.data.collection || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [user]);

  const handleBackButton = () => {
    navigate(`/${userData._id}/users`);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {/* BG Effects */}
      <div className="absolute rounded-full" style={{ top: "150px", left: "320px", width: "250px", height: "250px", background: "#002AA8", filter: "blur(180px)", pointerEvents: "none" }} />
      <div className="absolute rounded-full" style={{ top: "500px", left: "900px", width: "250px", height: "250px", background: "#002AA8", filter: "blur(180px)", pointerEvents: "none" }} />

      <div className="m-12 flex-1">
        {/* Tabs */}
        <div className="flex gap-8">
          <button onClick={() => setActiveTab("details")} className={`px-4 py-1 font-semibold ${activeTab === "details" ? "border-b-2 border-white text-white" : "text-white/60"}`}>User Details</button>
          <button onClick={() => setActiveTab("collections")} className={`px-4 py-1 font-semibold ${activeTab === "collections" ? "border-b-2 border-white text-white" : "text-white/60"}`}>User Collections</button>
          <button onClick={() => setActiveTab("created")} className={`px-4 py-1 font-semibold ${activeTab === "created" ? "border-b-2 border-white text-white" : "text-white/60"}`}>User Created Collection</button>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && <UserDetailsSection user={user} />}

        {activeTab === "collections" && (
          <div className="flex flex-wrap gap-8 mt-12">
            {loading ? (
              <p className="text-white">Loading collections...</p>
            ) : userCollections.length > 0 ? (
              userCollections.map((col) => <CollectionCard key={col._id} collection={col} />)
            ) : (
              <p className="text-white">No collections found.</p>
            )}
          </div>
        )}

        {activeTab === "created" && (
          <div className="flex flex-wrap gap-8 mt-12">
            {loading ? (
              <p className="text-white">Loading created collections...</p>
            ) : createdCollections.length > 0 ? (
              createdCollections.map((col) => <CollectionCard key={col._id} collection={col} />)
            ) : (
              <p className="text-white">No created collections found.</p>
            )}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-start ml-12 py-32">
        <button onClick={handleBackButton} className="w-[190px] h-[42px] rounded-[6px] flex items-center justify-center gap-[10px] bg-[#002AA8] text-white">
          Back
        </button>
      </div>
    </div>
  );
}

export default UserDetails;
