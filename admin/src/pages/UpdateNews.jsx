import React, { useState } from "react";
import uploadIcon from "../assets/CreateCollection/uploadIcon.png";
import ChainIcon from "../assets/CreateCollection/ChainIcon.png";
import BgEffect2 from "../components/common/BgEffect2"
import { useNavigate  } from "react-router-dom";
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

const handleCancelButton = ()=>{
  navigate("/edit-news")

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

  if(!Dashboard_Base_Url){
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
      navigate("/edit-news"); // redirect to your news listing page
    } else {
      toast.error(res.data.message || "Failed to create news");
    }
  } catch (error) {
    console.log("Error creating news:", error);
    toast.error("Server error");
  }finally {
    setLoading(false); // Stop loading always
  }
};

if (loading) {
  return <FullScreenLoader />;
}

  return (
    <div className="  min-h-screen w-full bg-black   overflow-hidden">
      {/* Background Glowing Effects */}
          <BgEffect2 Xaxis={950} Yaxis={10} />
          <BgEffect2 Xaxis={400} Yaxis={650} />
            {/* Content */}
      <div className="relative z-50">
        <div className="flex gap-10 mt-[80px] mx-8">
          {/* left side preview / modal */}
      <div
  className="flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/30"
  style={{
    width: "456px",
    height: "440px",
    borderRadius: "6px",
    borderStyle: "dashed",
    boxSizing: "border-box",
    position: "relative",
    cursor: "pointer", // make cursor pointer
  }}
  onDrop={handleDrop}
  onDragOver={handleDragOver}
>
  <label
    htmlFor="file-upload"
    className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
  >
    {selectedImage ? (
      <img
        src={selectedImage}
        alt="Preview"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          borderRadius: "6px",
        }}
      />
    ) : (
      <div className="flex flex-col items-center gap-2">
        <img src={uploadIcon} alt="" className="w-6 h-6" />
        <span className="text-blue-400 font-bold">Click to upload or drag and drop</span>
      </div>
    )}

    <input
      type="file"
      id="file-upload"
      style={{ display: "none" }}
      onChange={handleFileChange}
    />
  </label>
</div>

          {/* right side - form */}
          <div
            className="z-50 relative rounded-lg p-6"
            style={{
              width: "456px",
              // height: "440px",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "495px",
                height: "110px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxSizing: "border-box",
              }}
            >
              <div
                className="flex flex-col justify-start"
                style={{
                  width: "495px",
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <h2
                  className="px-2"
                  style={{
                    fontWeight: 600,
                    fontStyle: "normal",
                    fontSize: "25px",
                    lineHeight: "30px",
                    letterSpacing: "0%",
                    color: "white",
                    margin: 0,
                  }}
                >
                  Upload News
                </h2>

                <p
                  className="px-2"
                  style={{
                    width: "490px",
                    color: "#FFFFFFAB",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "18px",
                    lineHeight: "24px",
                    letterSpacing: "0%",
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                 Share important updates, announcements, or stories with your audience in real time.
                </p>
              </div>
            </div>

            {/* input fields  */}

            <div className="w-[430px] h-[84px] flex flex-col gap-[14px] mt-8 mx-2">
              <label
                htmlFor="name"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "18px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "white",
                }}
              >
                Heading
              </label>

              <input
                type="text"
                id="name"
                 value={heading}
  onChange={(e) => setHeading(e.target.value)}
                placeholder="Add Content"
                className="w-full h-10 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
              />
            </div>

            {/* second  */}

            {/* Right side textarea */}
          <div className="w-[430px] mt-8 mx-2 flex flex-col gap-[14px]">
            <label
              htmlFor="symbol"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "18px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "white",
              }}
            >
              Add News
            </label>

            <textarea
             value={description}
  onChange={(e) => setDescription(e.target.value)}
              id="symbol"
              placeholder="Create Name"
              className="bg-white/10 text-white border border-gray-600 rounded-[4px] focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors resize-none"
              style={{
                width: "451px",
                height: "245px",
                padding: "13px 15px",
                opacity: 1,
              }}
            />
          </div>
        
          </div>
        </div>

        {/* last buttons div  */}
        <div
          className="flex mt-16  justify-end mx-8 pt-16 pb-32 relative z-10"
          style={{
            opacity: 1,
            gap: "37px",
          }}
        >
       <button
  type="button"
  onClick={handleCancelButton}
  className="border border-white text-white hover:bg-white/10 transition-colors flex items-center justify-center"
  style={{
    width: "133px",
    height: "42px",
    borderRadius: "6px",
    gap: "10px",
    padding: "10px",
    background: "transparent",
    cursor: "pointer",
  }}
>
  Cancel
</button>

          <button onClick={handlePublish}
            className="bg-blue-800 hover:bg-blue-700 transition-colors"
            style={{
              width: "190px",
              height: "42px",
              borderRadius: "6px",
              gap: "10px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "18px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "white",
              }}
            >
              Publish 
            </span>
          </button>
        </div>
      </div>

      

    
    </div>
  );
}

export default UpdateNews;