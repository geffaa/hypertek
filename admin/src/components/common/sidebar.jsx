import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import Logo from "../../assets/Sidebar/logo.png";
import DashboardImage from "../../assets/Sidebar/dashboard.png";
import CreateCollection1 from "../../assets/Sidebar/create1.png";
import CreateCollection2 from "../../assets/Sidebar/create2.png";
import CollectionImage from "../../assets/Sidebar/collections.png";
import EditUser from "../../assets/Sidebar/editUser.png";
import NewsImage from "../../assets/Sidebar/news.png";
import TransactionImage from "../../assets/Sidebar/transaction.png";
import SaleImage from "../../assets/Sidebar/sale.png";
import SupportImage from "../../assets/Sidebar/support.png";
import LogoutImage from "../../assets/Sidebar/logout.png";

const Sidebar = ({  onLogoutClick}) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [openNews, setOpenNews] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [openSale, setOpenSale] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Dashboard");


  const sidebarRef = useRef(null);

  const toggleDropdown = (clickedDropdown, itemName) => {
    setOpenCreate(clickedDropdown === "create" ? !openCreate : false);
    setOpenCollection(
      clickedDropdown === "collection" ? !openCollection : false
    );
    setOpenNews(clickedDropdown === "news" ? !openNews : false);
    setOpenTransaction(
      clickedDropdown === "transaction" ? !openTransaction : false
    );
    setOpenSale(clickedDropdown === "sale" ? !openSale : false); // <--- new

    setSelectedItem(itemName);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenCreate(false);
        setOpenCollection(false);
        setOpenNews(false); // close News
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (itemName) => {
    setSelectedItem(itemName);
    setOpenCreate(false);
    setOpenCollection(false);
  };



  


  return (
    <>
    
<div className="text-white p-4 bg-[#100F0F] z-50  left-0 top-0 h-screen w-[298px] shrink-0 overflow-y-scroll scrollbar-hide">

    
   <div className="flex flex-col justify-between h-full">

      <div className="flex-1">
       {/* Logo */}
      <div className="hidden lg:flex items-center absolute top-[25px] left-[83px] gap-1.5 w-[132px] h-[25px]">
        <img src={Logo} alt="Logo" className="w-[25px] h-[25px]" />
        <span className="w-[101px] h-[22px] font-inter font-bold text-[18px] leading-[22px]">
          HYPER TEK
        </span>
      </div>

      {/* Menu */}
      <ul className="flex flex-col items-center mt-24">
        {/* Dashboard 1 */}
       <Link to="/">
       
        <li
          className={`flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer ${
            selectedItem === "Dashboard" ? "bg-[#002AA8]" : ""
          }`}
          style={{ width: "222px", height: "42px", opacity: 1 }}
          onClick={() => handleItemClick("Dashboard")}
        >
          <img
            src={DashboardImage}
            alt="Dashboard Icon"
            style={{ width: "22px", height: "22px" }}
          />
          <h1
            className="text-white font-bold"
            style={{
              width: "100px",
              height: "17px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              lineHeight: "17px",
            }}
          >
            Dashboard
          </h1>
        </li>
       </Link>

        {/* Create Collection 2 */}
        {/* <li
          className={`flex items-center justify-between  px-3 mt-4 cursor-pointer ${
            selectedItem === "Create Collection" ? "bg-[#002AA8]" : ""
          }`}
          style={{ width: "222px", height: "42px", opacity: 1 }}
          onClick={() => toggleDropdown("create", "Create Collection")}
        >
          <div className="flex items-center">
            <div className="relative">
              <img
                src={CreateCollection2}
                alt=""
                className="w-[16.5px] h-[16.5px]"
              />
              <img
                src={CreateCollection1}
                alt=""
                className="w-[9.17px] h-[9.17px] absolute top-[30%] left-[70%] transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <h1
              className="text-white font-bold ml-3"
              style={{
                width: "120px",
                height: "17px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "17px",
              }}
            >
              Create Collection
            </h1>
          </div>

          {openCreate ? (
            <FiChevronUp className="text-white" />
          ) : (
            <FiChevronDown className="text-white" />
          )}
        </li> */}

        {/* Dropdown Options */}
        {/* {openCreate && (
          <ul className="flex flex-col items-start w-[129px] h-[27px] mb-8  opacity-100 rounded mr-3 ">
            <div className="flex">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal  pt-2 leading-none text-white hover:text-slate-300 cursor-pointer">
                <Link to="/create-collection">Create Collection</Link>
              </li>
            </div>
            <div className="flex">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal  pt-2 leading-none text-white hover:text-slate-300 cursor-pointer">
                <Link to="/collection-details">Collection Details</Link>
              </li>
            </div>
            <div className="flex">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal   leading-none text-white hover:text-slate-300 cursor-pointer">
                <Link to="/creator-earning">Creator Earning</Link>
              </li>
            </div>
          </ul>
        )} */}

        {/* Collections  3 */}

        <li
          className={`flex items-center justify-between  px-3 mt-4 cursor-pointer ${
            selectedItem === "Collection" ? "bg-[#002AA8]" : ""
          }`}
          style={{ width: "222px", height: "42px", opacity: 1 }}
          onClick={() => toggleDropdown("collection", "Collection")}
        >
          <div className="flex items-center">
            <div className="relative">
              <img src={CollectionImage} alt="" className="w-[22px] h-[22px]" />
            </div>
            <h1
              className="text-white font-bold ml-3"
              style={{
                width: "120px",
                height: "17px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "17px",
              }}
            >
              Collection
            </h1>
          </div>

          {openCollection ? (
            <FiChevronUp className="text-white" />
          ) : (
            <FiChevronDown className="text-white" />
          )}
        </li>

        {/* Dropdown Options */}
        {openCollection && (
          <ul className="flex flex-col items-start w-[129px] h-[65px]   opacity-100 rounded mr-3 ">
           
            <div className="flex">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal  pt-2 leading-none text-white hover:text-slate-300 cursor-pointer">
                <Link to="/collections">Collections</Link>
              </li>
            </div>
            <div className="flex">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal  pt-2 leading-none text-white hover:text-slate-300 cursor-pointer">
                <Link to="/character-collection">Character</Link>
              </li>
            </div>
            <div className="flex ">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal  pt-2 leading-none text-white ">
                <Link to="/land-collection" className="hover:text-slate-300 cursor-pointer">Land</Link>
              </li>
            </div>
          </ul>
        )}

        {/* Edit User 4  */}
  <Link to="/users">
        <li
          className={`flex items-center justify-between  px-3 mt-4 cursor-pointer ${
            selectedItem === "users" ? "bg-[#002AA8]" : ""
          }`}
          style={{ width: "222px", height: "42px", opacity: 1 }}
          onClick={() => handleItemClick("users")}
        >
          <div className="flex items-center">
            <div className="relative">
              <img src={EditUser} alt="" className="w-[22px] h-[22px]" />
            </div>
            <h1
              className="text-white font-bold ml-3"
              style={{
                width: "120px",
                height: "17px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "17px",
              }}
            >
              Edit User
            </h1>
          </div>
        </li>
  </Link>

        {/* News section 5  */}

        <li
          className={`flex items-center justify-between  px-3 mt-4 cursor-pointer ${
            selectedItem === "News" ? "bg-[#002AA8]" : ""
          }`}
          style={{ width: "222px", height: "42px", opacity: 1 }}
          onClick={() => toggleDropdown("news", "News")}
        >
          <div className="flex items-center">
            <div className="relative">
              <img src={NewsImage} alt="" className="w-[22px] h-[22px]" />
            </div>
            <h1
              className="text-white font-bold ml-3"
              style={{
                width: "120px",
                height: "17px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "17px",
              }}
            >
              Update News
            </h1>
          </div>

          {openNews ? (
            <FiChevronUp className="text-white" />
          ) : (
            <FiChevronDown className="text-white" />
          )}
        </li>

        {/* Dropdown Options */}
        {openNews && (
          <ul className="flex flex-col items-start w-[129px] h-[60px] mb-2   opacity-100 rounded mr-3 ">
            <div className="flex">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal  pt-2 leading-none text-white hover:text-slate-300 cursor-pointer">
                <Link to="/add-news">Add News</Link>
              </li>
            </div>
             <div className="flex">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal  pt-2 leading-none text-white hover:text-slate-300 cursor-pointer">
                <Link to="/edit-news">Edit News</Link>
              </li>
            </div>
             <div className="flex">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal  pt-2 leading-none text-white hover:text-slate-300 cursor-pointer">
                <Link to="/other-news">Other News</Link>
              </li>
            </div>
           
          </ul>
        )}

        {/* Collection on sale  */}

        <Link to="/collection-listed-sale">
        <li
          className={`flex items-center justify-between  px-3 mt-4 cursor-pointer ${
            selectedItem === "Sale" ? "bg-[#002AA8]" : ""
          }`}
          style={{ width: "222px", height: "42px", opacity: 1 }}
          onClick={() => toggleDropdown("sale", "Sale")}
        >
          <div className="flex items-center">
            <div className="relative">
              <img src={SaleImage} alt="" className="w-[22px] h-[22px]" />
            </div>
            <h1
              className="text-white font-bold ml-3"
              style={{
                width: "130px",
                height: "17px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "17px",
              }}
            >
              Collection on Sale
            </h1>
          </div>

          {openSale ? (
            <FiChevronUp className="text-white" />
          ) : (
            <FiChevronDown className="text-white" />
          )}
        </li>
        
        </Link>

        {/* Dropdown Options */}
        {/* {openSale && (
          <ul className="flex flex-col items-start w-[129px] h-[27px]   opacity-100 rounded mr-3 ">
            <div className="flex">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal  pt-2 leading-none text-white hover:text-slate-300 cursor-pointer">
                <Link to="/create-collection">Sale 1</Link>
              </li>
            </div>
            <div className="flex">
              <div className=" w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b-1 border-b-[#494A4C]"></div>
              <li className="w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal  pt-2 leading-none text-white hover:text-slate-300 cursor-pointer">
                <Link to="/create-collection">Sale 2</Link>
              </li>
            </div>
          </ul>
        )} */}

        {/* Transaction News 6  */}
      <Link to="/transactions">
        <li
          className={`flex items-center justify-between  px-3 mt-4 cursor-pointer ${
            selectedItem === "Transaction" ? "bg-[#002AA8]" : ""
          }`}
          style={{ width: "222px", height: "42px", opacity: 1 }}
          onClick={() => toggleDropdown("transaction", "Transaction")}
        >
          <div className="flex items-center">
            <div className="relative">
              <img
                src={TransactionImage}
                alt=""
                className="w-[22px] h-[22px]"
              />
            </div>
            <h1
              className="text-white font-bold ml-3"
              style={{
                width: "120px",
                height: "17px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "17px",
              }}
            >
              Transaction
            </h1>
          </div>
        </li>
      </Link>

        {/* Support 7  */}
    <Link to="/support">
        <li
          className={`flex items-center justify-between  px-3 mt-4 cursor-pointer ${
             selectedItem === "support" ? "bg-[#002AA8]" : ""
          }`}
          style={{ width: "222px", height: "42px", opacity: 1 }}
          onClick={() => handleItemClick("support")}
        >
          <div className="flex items-center">
            <div className="relative">
              <img src={SupportImage} alt="" className="w-[22px] h-[22px]" />
            </div>
            <h1
              className="text-white font-bold ml-3"
              style={{
                width: "120px",
                height: "17px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "17px",
              }}
            >
              Support
            </h1>
          </div>
        </li>
    </Link>
      </ul>

     </div>
   <button
    onClick={onLogoutClick} // Use the prop instead of local state
    className="
      mx-auto
      w-[122px] h-[48px]
      rounded-[10px]
      px-[15px] py-[12px]
      flex items-center
      cursor-pointer
      opacity-100
    "
  >
    <div className="flex items-center mt-16 mb-12">
      <img src={LogoutImage} alt="" className="w-[22px] h-[22px]" />
      <h1
        className="text-white font-bold ml-1"
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "14px",
          lineHeight: "17px",
        }}
      >
        Sign Out
      </h1>
    </div>
  </button>
   </div>

    </div>
    

    


    </>
  );
};

export default Sidebar;
