import React, { useState } from "react";
import uploadIcon from "../assets/CreateCollection/uploadIcon.png";
import ChainIcon from "../assets/CreateCollection/ChainIcon.png";
import { useNavigate } from "react-router-dom";
import axios from "axios"
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";
import FullScreenLoader from "../components/common/Spinner";


function UpdateNews() {
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  // Add this with your other useState declarations
  const [loading, setLoading] = useState(false);
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null); // actual File object, not base64


  // Handle file selection
  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setFile(selected); // store file for API upload

      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result); // preview
      };
      reader.readAsDataURL(selected);
    }
  };

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    const selected = event.dataTransfer.files[0];
    if (selected) {
      setFile(selected);

      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // allow drop
  };


  // handle cancel button
  const handleCancelButton = () => {
    navigate(-1);
  }



  const handlePublish = async () => {
    if (!heading || !description || !file) {
      toast.error("Heading, description & image are required");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("description", description);
    formData.append("image", file);

    if (!Dashboard_Base_Url) {
      toast.error("Base url is required")
    }

    try {
      const res = await axios.post(
        `${Dashboard_Base_Url}/v1/news/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success("News created successfully!");
        navigate(-1);
      } else {
        toast.error(res.data.message || "Failed to create news");
      }
    } catch (error) {
      console.log("Error creating news:", error);
      toast.error("Server error");
    } finally {
      setLoading(false); // Stop loading always
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side — image upload */}
        <div
          className="flex items-center justify-center bg-white/5 backdrop-blur-sm border border-dashed border-white/30 rounded-md cursor-pointer flex-shrink-0"
          style={{ width: "min(456px, 100%)", height: "440px" }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            {selectedImage ? (
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-md" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <img src={uploadIcon} alt="" className="w-6 h-6" />
                <p className="text-white/80 text-sm">
                  <span className="text-blue-400 font-bold">Click to upload</span> or drag and drop
                </p>
              </div>
            )}
            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {/* Right side — form */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          <div>
            <h2 className="text-white font-semibold text-[25px] leading-tight mb-1">Upload News</h2>
            <p className="text-white/70 text-[15px]">
              Share important updates, announcements, or stories with your audience in real time.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="news-heading" className="text-white text-[16px]">Heading</label>
            <input
              type="text"
              id="news-heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Add Content"
              className="w-full h-10 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="news-desc" className="text-white text-[16px]">Add News</label>
            <textarea
              id="news-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write news content..."
              rows={7}
              className="w-full px-3 py-3 bg-white/10 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-6 mt-8 pb-4">
        <button
          type="button"
          onClick={handleCancelButton}
          className="border border-white text-white hover:bg-white/10 transition-colors w-[120px] h-[36px] rounded-md cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handlePublish}
          className="bg-blue-800 hover:bg-blue-700 transition-colors text-white w-[120px] h-[36px] rounded-md cursor-pointer"
        >
          Publish
        </button>
      </div>
    </div>
  );
}

export default UpdateNews;