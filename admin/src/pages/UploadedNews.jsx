import React, { useState, useRef } from "react";
import uploadIcon from "../assets/CreateCollection/uploadIcon.png";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";
import FullScreenLoader from "../components/common/Spinner";
import toast from "react-hot-toast";

function UpdateNewsItems() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { newsItem } = location.state || {};
  const [selectedImage, setSelectedImage] = useState(null);
  const [heading, setHeading] = useState(newsItem?.name || newsItem?.heading || "");
  const [description, setDescription] = useState(newsItem?.description || "");

  const fileInputRef = useRef(null);

  const handleDivClick = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => event.preventDefault();

  const handleCancelButton = () => navigate(-1);

  const handleUpdateNews = async () => {
    if (!heading || !description) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!newsItem?._id && !newsItem?.id) {
      toast.error("News ID is required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("description", description);
      if (selectedImage) {
        const blob = await (await fetch(selectedImage)).blob();
        formData.append("image", blob, "news-image.png");
      }

      const newsId = newsItem._id || newsItem.id;
      const response = await axios.put(
        `${Dashboard_Base_Url}/v1/news/edit/${newsId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        toast.success("News updated successfully");
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update news");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side — image upload */}
        <div
          className="flex items-center justify-center bg-white/5 backdrop-blur-sm border border-dashed border-white/30 rounded-md cursor-pointer flex-shrink-0"
          style={{ width: "min(456px, 100%)", height: "440px" }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleDivClick}
        >
          {selectedImage ? (
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-md" />
          ) : newsItem?.image ? (
            <img
              src={newsItem.image.startsWith("http") ? newsItem.image : `${Image_Base_Url}${newsItem.image}`}
              alt="Current"
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <img src={uploadIcon} alt="" className="w-6 h-6" />
              <p className="text-white/80 text-sm">
                <span className="text-blue-400 font-bold">Click to upload</span> or drag and drop
              </p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Right side — form */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          <div>
            <h2 className="text-white font-semibold text-[25px] leading-tight mb-1">Edit News</h2>
            <p className="text-white/70 text-[15px]">
              Update your news content below and publish changes.
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
            <label htmlFor="news-desc" className="text-white text-[16px]">News Content</label>
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
          onClick={handleUpdateNews}
          className="bg-blue-800 hover:bg-blue-700 transition-colors text-white w-[120px] h-[36px] rounded-md cursor-pointer"
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default UpdateNewsItems;
