import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import uploadIcon from "../assets/images/CreateCollection/uploadIcon.png";
import ChainIcon from "../assets/images/CreateCollection/ChainIcon.png"


function EditColelctions() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader(); 
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
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

  const handleDragOver = (event) => {
    event.preventDefault();
  };


const handleNavigate = ()=>{
  navigate("/dashboard/collections")
}



  return (
    <div className="p-8 bg-black h-[850px] pb-12 flex flex-col gap-6">

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
      <h1
        className="font-inter px-4 font-semibold text-[25px] text-white"
        style={{
          lineHeight: "30px",
          letterSpacing: "0%",
        }}
      >
        Edit Collection
      </h1>

      <div className="flex justify-between items-center">
    <div>
  {/* Name Field */}
  <div className="rounded-md p-4 flex flex-col gap-2 relative z-50" style={{ width: "434px" }}>
    <label
      htmlFor="name"
      className="font-inter font-normal text-[18px] text-white"
      style={{ lineHeight: "22px", letterSpacing: "0%" }}
    >
      Name
    </label>
  <input
  type="text"
  id="name"
  placeholder="Add Name"
  className="text-white placeholder-[#FFFFFFAB] bg-transparent rounded border border-[#FFFFFFAB] px-4 py-3 w-full focus:outline-none"
  style={{
    width: "400px",
    height: "40px",
    borderRadius: "4px",
    letterSpacing: "0%",
  }}
/>

  </div>

  {/* Description Field */}
  {/* <div className="rounded-md p-4 flex flex-col gap-2 relative z-50" style={{ width: "434px" }}>
    <label
      htmlFor="description"
      className="font-inter font-normal text-[18px] text-white"
      style={{ lineHeight: "22px", letterSpacing: "0%" }}
    >
      Description
    </label>
    <textarea
      id="description"
      placeholder="Description"
      className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-3 w-full h-[93px] focus:outline-none resize-none bg-transparent"
      style={{
        width: "400px",
        borderRadius: "4px",
        letterSpacing: "0%",
      }}
    />
  </div> */}

  <div className="w-[405px] h-[84px] ml-3 flex flex-col gap-[14px] mt-8 mx-2">
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
                Token Symbol
              </label>

              <input
                type="text"
                id="symbol"
                placeholder="Create Name"
                className="w-full h-10 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
              />
            </div>


               <div className="w-[405px] ml-3 h-[84px] flex flex-col gap-[14px] mt-8 mx-2">
                          <label
                            htmlFor="chain"
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
                            Chain
                          </label>
            
                          <div className="flex items-center rounded-md bg-white/10 text-white border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors px-2">
                            <div
                              className="w-[17px] h-[17px] rounded-2xl flex items-center justify-center"
                              style={{
                                background:
                                  "linear-gradient(180deg, #2AAC4F 0%, #85F3BE 100%)",
                              }}
                            >
                              <img
                                src={ChainIcon}
                                alt=""
                                className="w-[10.62px] h-[9.78px]"
                              />
                            </div>
            
                            <input
                              type="text"
                              id="chain"
                              placeholder="USDT"
                              className="w-full h-10 px-3 bg-transparent outline-none"
                            />
                          </div>
                        </div>



                         <div className="flex m-3 justify-between  mt-5">
          {/* Creator Fee */}
          <div className="flex flex-col gap-2 w-[170px]">
            <h1 className="font-inter font-normal text-[18px] m-0">Creator Fee</h1>
            <div className="flex items-center border border-[#555] rounded-md h-[48px] px-3">
              <input
                type="text"
                defaultValue="0"
                className="w-full bg-transparent border-none outline-none text-[18px] text-white/70 font-inter"
              />
              <span className="text-[18px] text-white/70 px-2">%</span>
            </div>
            <p className="text-[14px] text-white/70 font-inter m-0">
              Support 100% total fee
            </p>
          </div>

          {/* Supply */}
          <div className="flex flex-col gap-2 w-[170px]">
            <h1 className="font-inter font-normal text-[18px] m-0">Supply</h1>
            <div className="flex items-center border border-[#555] rounded-md h-[48px] px-3">
              <input
                type="text"
                defaultValue="0"
                className="w-full bg-transparent border-none outline-none text-[18px] text-white/70 font-inter"
              />
            </div>
          </div>
        </div>

  {/* Price Field */}
  <div className="rounded-md p-4 flex flex-col gap-2" style={{ width: "434px" }}>
    <label
      htmlFor="price"
      className="font-inter font-normal text-[18px] text-white"
      style={{ lineHeight: "22px", letterSpacing: "0%" }}
    >
      Price
    </label>
    <input
      type="text"
      id="price"
      placeholder="Add Price"
      className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-3 w-full focus:outline-none bg-transparent"
      style={{
        width: "400px",
        height: "40px",
        borderRadius: "4px",
        letterSpacing: "0%",
      }}
    />
  </div>
</div>


    {/* right side - image upload */}
<div
  className="flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/30 rounded-md"
  style={{
    width: "324px",
    height: "312px",
    borderStyle: "dashed",
    position: "relative",
    cursor: "pointer", // indicate clickable
  }}
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onClick={() => document.getElementById("edit-file-upload").click()} // trigger file input
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
      <div className="relative w-[240px] h-[40px] flex items-center justify-center">
        <input
          type="file"
          accept="image/*"
          id="edit-file-upload" // new id for this input
          onChange={handleFileChange}
          className="absolute w-full h-full opacity-0 pointer-events-none" // won't block div click
        />
        <span className="text-white font-semibold text-center">
          Click to upload or drag and drop
        </span>
      </div>
    </div>
  )}
</div>

      </div>

      <div className="w-full flex justify-between px-12 items-center pt-24">

       <button onClick={handleNavigate}
  className="flex items-center justify-center rounded-[6px] px-4 py-2"
  style={{
    width: "190px",
    height: "42px",
    gap: "10px",
    borderRadius: "6px",
    padding: "10px",
    background: "#002AA8",
    opacity: 1,
    transform: "rotate(0deg)",
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
      lineHeight: "22px",
      letterSpacing: "0%",
      color: "#FFFFFF",
    }}
  >
    Back
  </span>
</button>
<button
  className="flex items-center justify-center rounded-[6px] px-4 py-2"
  style={{
    width: "190px",
    height: "42px",
    gap: "10px",
    borderRadius: "6px",
    padding: "10px",
    background: "#002AA8",
    opacity: 1,
    transform: "rotate(0deg)",
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
      lineHeight: "22px",
      letterSpacing: "0%",
      color: "#FFFFFF",
    }}
  >
    Add to Collection
  </span>
</button>

      </div>
    </div>
  );
}

export default EditColelctions;
