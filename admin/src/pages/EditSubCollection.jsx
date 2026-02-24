import React, { useState, useRef, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import uploadIcon from "../assets/CreateCollection/uploadIcon.png";

import toast from "react-hot-toast";

import axios from "axios";

import { Dashboard_Base_Url, Image_Base_Url } from "../Config";



function EditSubCollection() {

  const navigate = useNavigate();

  const location = useLocation();



  const subCollectionId = location.state?.subCollectionId;

  const parentId = location.state?.parentId;

  const existingData = location.state?.existingData;



  const fileInputRef = useRef(null);



  const [selectedImage, setSelectedImage] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [priceETH, setPriceETH] = useState("");

  const [loading, setLoading] = useState(false);



  // Existing data load کرنا

  useEffect(() => {

    if (existingData) {

      setName(existingData.name || "");

      setDescription(existingData.description || "");

      setPriceETH(existingData.priceETH || existingData.price || "");



      if (existingData.image) {

        setSelectedImage(`${Image_Base_Url}${existingData.image}`);

      }

    }

  }, [existingData]);



  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;



    const reader = new FileReader();

    reader.onload = () => setSelectedImage(reader.result);

    reader.readAsDataURL(file);

    setImageFile(file);

  };



  const handleDrop = (e) => {

    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (!file) return;



    const reader = new FileReader();

    reader.onload = () => setSelectedImage(reader.result);

    reader.readAsDataURL(file);

    setImageFile(file);

  };



  const handleDragOver = (e) => e.preventDefault();



  const handleSubmit = async () => {

    if (!name.trim()) return toast.error("Name is required");

    if (!parentId) return toast.error("Parent collection not found");

    if (!subCollectionId) return toast.error("Sub-collection ID not found");



    setLoading(true);

    try {

      const formData = new FormData();

      formData.append("name", name);

      formData.append("description", description);

      formData.append("priceETH", priceETH);



      if (imageFile) {

        formData.append("image", imageFile);

      }



      const response = await axios.put(

        `${Dashboard_Base_Url}/v1/nft/parent-collection/${parentId}/sub-collection/${subCollectionId}`,

        formData,

        { headers: { "Content-Type": "multipart/form-data" } }

      );



      if (response.data.success) {

        toast.success("Sub-collection updated successfully");

        // 🔥 Dispatch event to update Category page and sidebar instantly

        console.log("Dispatching categoriesUpdated event from EditSubCollection");

        window.dispatchEvent(new Event("categoriesUpdated"));

        setTimeout(() => navigate(-1), 800);

      } else {

        toast.error(response.data.message || "Update failed");

      }

    } catch (err) {

      console.error("Update error:", err);

      if (err.response?.data?.error) {

        toast.error(err.response.data.error);

      } else if (err.response?.data?.message) {

        toast.error(err.response.data.message);

      } else {

        toast.error("Failed to update sub-collection");

      }

    } finally {

      setLoading(false);

    }

  };



  if (!parentId || !subCollectionId) {

    return (

      <div className="flex items-center justify-center h-screen bg-black text-white">

        No parent collection or sub-collection selected

      </div>

    );

  }



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

        className="absolute rounded-full"

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

        className="absolute rounded-full"

      ></div>



      {/* Header */}

      <h1 className="font-inter px-4 font-semibold text-[25px] text-white">

        Edit Collection

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

              Price (ETH)

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

              className="max-w-full max-h-full rounded-md object-contain"

            />

          ) : (

            <div className="flex flex-col items-center justify-center gap-2">

              <img src={uploadIcon} alt="Upload" className="w-6 h-6" />

              <span className="text-white font-semibold text-center">

                Click to upload or drag and drop

              </span>

              <span className="text-gray-400 text-sm">

                (Leave empty to keep existing image)

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

          disabled={loading}

          className="flex items-center justify-center rounded-[6px] px-4 py-2"

          style={{

            width: "190px",

            height: "42px",

            background: "#666",

            border: "none",

            cursor: "pointer",

            opacity: loading ? 0.6 : 1

          }}

        >

          <span className="text-white font-inter text-[18px]">Cancel</span>

        </button>

        <button

          onClick={handleSubmit}

          disabled={loading}

          className="flex items-center justify-center rounded-[6px] px-4 py-2"

          style={{

            width: "190px",

            height: "42px",

            background: "#002AA8",

            border: "none",

            cursor: loading ? "not-allowed" : "pointer",

            opacity: loading ? 0.6 : 1

          }}

        >

          <span className="text-white font-inter text-[18px]">

            {loading ? "Updating..." : "Update Collection"}

          </span>

        </button>

      </div>

    </div>

  );

}



export default EditSubCollection;