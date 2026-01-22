import React, { useState , useRef, } from "react";
import { useParams,  useLocation,  useNavigate } from "react-router-dom";
import uploadIcon from "../assets/CreateCollection/uploadIcon.png";
import ChainIcon from "../assets/CreateCollection/ChainIcon.png";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";
import FullScreenLoader from "../components/common/Spinner";

function EditCollection2() {
    const location = useLocation();
  const navigate = useNavigate();
  // Add this near your other useState declarations
const [updating, setUpdating] = useState(false);
  // inside component
const fileInputRef = useRef(null);

  // Get the collection object passed via state
  const collection = location.state?.collection;

  console.log("Received collection:", collection);






  const [name, setName] = useState(collection.name);
const [symbol, setSymbol] = useState(collection.collectionData.symbol);
const [priceETH, setPriceETH] = useState(
  collection?.collectionData?.priceETH || ""
);


  const [selectedImage, setSelectedImage] = useState(null);
const [chain, setChain] = useState(collection.collectionData.chain);
const [royaltyPercent, setRoyaltyPercent] = useState(collection.collectionData.royaltyPercent);
const [supply, setSupply] = useState( collection.collectionData.supply);
const [royaltyWallet, setRoyaltyWallet] = useState(collection.collectionData.royaltyWallet);
const [collectionType, setCollectionType] = useState(
  collection.collectionData.Type || ""
);



  if (!collection) {
    return <div className="text-white">No collection data found!</div>;
  }







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

 const handleNavigate = () => {
  navigate(-1);
};


/// update the user data 
const handleUpdate = async () => {
  if (!Dashboard_Base_Url) {
    toast.error("Base URL is required");
    return;
  }
   setUpdating(true); // Start loading

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("symbol", symbol);
    formData.append("chain", chain);
    formData.append("royaltyPercent", royaltyPercent);
    formData.append("royaltyWallet", royaltyWallet);
    formData.append("supply", supply);
    formData.append("priceETH", priceETH);
    formData.append("owner", "admin");
    formData.append("creator", "admin");
formData.append("collectionType", collectionType); // use correct key


    if (selectedImage) {
      // Convert base64 to blob before appending
      const blob = await fetch(selectedImage).then(res => res.blob());
      formData.append("image", blob, "image.png");
    }

    const collectionId = collection._id || collection.id;
    const response = await axios.put(
      `${Dashboard_Base_Url}/v1/nft/collection/update/${collectionId}`, // remove extra /api if needed
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    toast.success("Collection updated successfully!");
    console.log("your update response are:", response);
    navigate("/collections");
  } catch (error) {
    toast.error(error.response?.data?.message || "Update failed!");
  }
   finally {
    setUpdating(false); // Stop loading regardless of success/error
  }
};

// Place this right before your main return statement
if (updating) {
  return <FullScreenLoader />;
}
  return (
    <div className="p-8 bg-black h-[980px] py-12  flex flex-col gap-6">
      
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
          <div
            className="rounded-md p-4 flex w-[300px] flex-col gap-2 relative z-50"
            
          >
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
                value={name}
  onChange={(e) => setName(e.target.value)}
                placeholder={collection.name}

              className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-3 focus:outline-none"
              style={{
                width: "400px",
                height: "40px",
                borderRadius: "4px",
                letterSpacing: "0%",
              }}
            />
          </div>

          {/* Description Field */}
          <div className="rounded-md p-4 flex flex-col gap-2 relative z-50" style={{ width: "434px" }}>
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
  </div>


         {/* Price Field */}
<div
  className="rounded-md p-4 flex flex-col gap-2"
  style={{ width: "405px" }}
>
  <label
    htmlFor="priceETH"
    className="font-inter font-normal text-[18px] text-white"
    style={{ lineHeight: "22px", letterSpacing: "0%" }}
  >
    Price
  </label>

  <input
    type="number"
    id="priceETH"
    placeholder=""
    min="0"
    step="0.0001"
    value={priceETH}
    onChange={(e) => setPriceETH(e.target.value)}
    className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-3 w-full focus:outline-none bg-transparent"
    style={{
      width: "200px",
      height: "40px",
      borderRadius: "4px",
      letterSpacing: "0%",
    }}
  />
</div>

        </div>

        {/* right side  */}
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
  onClick={() => fileInputRef.current?.click()}   // <-- trigger file input
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

  {/* Hidden file input */}
  <input
    type="file"
    accept="image/*"
    ref={fileInputRef}           // <-- assign ref
    onChange={handleFileChange}
    className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-none"
  />
</div>

      </div>

      <div className="w-full flex justify-between px-12 items-center pt-24">
        <button
          onClick={handleNavigate}
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
        <button onClick={handleUpdate}
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
            Save
          </span>
        </button>
      </div>
    </div>
  );
}

export default EditCollection2;
