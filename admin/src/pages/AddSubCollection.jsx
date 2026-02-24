import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import uploadIcon from "../assets/CreateCollection/uploadIcon.png";
import toast from "react-hot-toast";
import axios from "axios";

function AddSubCollection() {
  const navigate = useNavigate();
  const location = useLocation();

  const parentId = location.state?.parentId;
  const parentName = location.state?.parentName;

  if (!parentId) {
    return <div className="text-white p-8">No parent collection selected</div>;
  }

  const fileInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceETH, setPriceETH] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Name required");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("priceETH", priceETH);
      formData.append("Type", "characters");

      if (selectedImage && selectedImage.startsWith("data:")) {
        const blob = await fetch(selectedImage).then((res) => res.blob());
        formData.append("image", blob, "image.png");
      }

      await axios.post(
        `https://api-hyper-tek-games.deventiatech.com/api/v1/nft/parent-collection/${parentId}/sub-collection`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Sub-collection added successfully");
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to add sub-collection");
    }
  };

  return (
    <div className="mt-8 flex h-[700px] bg-black flex-col">
      {/* Blur background circles */}
      <div
        style={{
          top: `120px`,
          left: `320px`,
          width: "300px",
          height: "300px",
          background: "#002AA8",
          filter: "blur(230px)",
        }}
        className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>
      <div
        style={{
          top: `520px`,
          left: `950px`,
          width: "300px",
          height: "300px",
          background: "#002AA8",
          filter: "blur(230px)",
        }}
        className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      {/* Header */}
      <h1 className="font-inter px-4 font-semibold text-[25px] text-white">
        Add Collection
      </h1>

      <div className="flex justify-between items-center">
        {/* Left Form */}
        <div>
          {/* Name */}
          <div className="rounded-md p-4 flex flex-col gap-2 relative z-50 w-[400px]">
            <label className="font-inter font-normal text-[18px] text-white">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Name"
              className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-3 focus:outline-none bg-transparent"
              style={{ height: "40px" }}
            />
          </div>

          {/* Description */}
          <div className="rounded-md p-4 flex flex-col gap-2 relative z-50 mt-4 w-[400px]">
            <label className="font-inter font-normal text-[18px] text-white">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-3 w-full h-[93px] focus:outline-none resize-none bg-transparent"
            />
          </div>

          {/* Price */}
          <div className="rounded-md p-4 flex flex-col gap-2 mt-4 w-[200px]">
            <label className="font-inter font-normal text-[18px] text-white">
              Price
            </label>
            <input
              type="number"
              min="0"
              value={priceETH}
              onChange={(e) => setPriceETH(e.target.value)}
              placeholder="Enter Price"
              className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-3 w-full focus:outline-none bg-transparent"
              style={{ height: "40px" }}
            />
          </div>
        </div>

        {/* Right Image Upload */}
        <div
          className="flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/30 rounded-md cursor-pointer"
          style={{
            width: "324px",
            height: "312px",
            borderStyle: "dashed",
            position: "relative",
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full rounded-md"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <img src={uploadIcon} alt="Upload" className="w-6 h-6" />
              <span className="text-white font-semibold text-center">
                Click to upload or drag and drop
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full flex justify-between px-12 items-center pt-24">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-[6px] px-4 py-2"
          style={{
            width: "190px",
            height: "42px",
            background: "#002AA8",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span className="text-white font-inter text-[18px]">Back</span>
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center justify-center rounded-[6px] px-4 py-2"
          style={{
            width: "190px",
            height: "42px",
            background: "#002AA8",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span className="text-white font-inter text-[18px]">
            Add to Collection
          </span>
        </button>
      </div>
    </div>
  );
}

export default AddSubCollection;
