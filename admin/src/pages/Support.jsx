import React, { useState } from "react";
import ChatImage from "../assets/chat.png";
import Icon1 from "../assets/Support/icon1.png";
import Icon2 from "../assets/Support/icon2.png";
import Icon3 from "../assets/Support/icon3.png";
import Icon4 from "../assets/Support/icon4.png";
import SendIcon from "../assets/Support/sendIcon.png";

function Support() {
  const [selectedChat, setSelectedChat] = useState(0); // Track selected chat index

  const chats = [
    {
      name: "Mr. Rosemary Koss",
      message: "Hi, I want to ask something....",
      count: 1,
    },
    {
      name: "Ms. Jane Doe",
      message: "Can we reschedule the meeting?",
      count: 2,
    },
    { name: "John Smith", message: "Thanks for the update!", count: 3 },
    { name: "Alice Johnson", message: "Please review the document.", count: 5 },
  ];

  const handleChatClick = (index) => {
    setSelectedChat(index);
  };

  return (
    <div className="flex min-h-screen bg-black p-4 ">
      <div
        style={{
          top: "20px",
          left: "360px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>

      <div
        style={{
          top: "810px",
          left: "960px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>

      {/* Left Sidebar */}
      <div className="flex flex-col w-[304px] min-h-[750px] border-2 border-[#1E1E1E] gap-4 p-2">
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`flex items-center justify-between gap-2 h-[45px] my-2 cursor-pointer p-2 rounded ${
              selectedChat === index ? "bg-gray-800" : ""
            }`}
            onClick={() => handleChatClick(index)}
          >
            <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
            <div className="flex flex-col flex-1 justify-center gap-0.5">
              <h1 className="font-inter font-semibold text-[14px] text-[#414651] m-0">
                {chat.name}
              </h1>
              <p className="font-inter font-medium text-[12px] text-[#757285] m-0">
                {chat.message}
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-1">
                <div className="w-[4px] h-[4px] rounded-full bg-[#a19e9e]"></div>
                <div className="w-[4px] h-[4px] rounded-full bg-[#a6a0a0]"></div>
                <div className="w-[4px] h-[4px] rounded-full bg-[#b8b4b4]"></div>
              </div>
              <div className="w-5 h-5 bg-[#D34827] rounded-sm flex items-center justify-center">
                <p className="text-white font-inter font-medium text-[10px] m-0">
                  {chat.count}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Center Chat Area */}
      <div className="flex flex-col w-[554px] h-[846px] px-4">
        {/* Top Status */}
        <div className="flex items-center gap-2 w-full h-[50px] border-b border-white">
          <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
          <p className="font-inter font-medium text-white">
            {chats[selectedChat]?.name || "Select a chat"} - Online
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex flex-col gap-4 mt-4">
          {/* Sender Message */}
          <div className="flex justify-end gap-3 items-end">
            <div className="flex flex-col w-[401px] h-[74px] gap-2 p-2.5 bg-[#1D7AD6] rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] text-white">
              <p className="font-inter font-medium text-[12px] leading-4">
                Thank you. Please enter the amount and date of the transaction
                (eg 100, December 21th).
              </p>
              <p className="text-right font-inter font-medium text-[12px] leading-4">
                13:34
              </p>
            </div>
            <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
          </div>

          {/* Receiver Message */}
          <div className="flex flex-col w-[188px] h-[58px] bg-[#F3F4F6] rounded-tr-[12px] rounded-tl-[12px] rounded-br-[12px] p-3 gap-2">
            <p className="font-inter font-medium text-[12px] leading-4 text-black">
              Rs50, November 30th
            </p>
            <p className="font-inter font-medium text-[12px] leading-4 text-right text-[#797782]">
              13:34
            </p>
          </div>

          {/* Second Sender */}
          <div className="flex justify-end gap-3 items-end">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col w-[401px] h-[74px] gap-2 p-2.5 bg-[#1D7AD6] rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] text-white">
                <p className="font-inter font-medium text-[12px] leading-4">
                  Thank you. It seems there might be a delay in processing the
                  transaction. What would you like to do next?
                </p>
                <p className="text-right font-inter font-medium text-[12px] leading-4">
                  13:34
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end mt-2">
                <div className="w-[175px] h-[32px] bg-[#1D7AD6] rounded-[6px] flex items-center justify-center">
                  <p className="font-inter font-medium text-[12px] text-white">
                    Retry Checking the Balance
                  </p>
                </div>
                <div className="w-[175px] h-[32px] bg-[#1D7AD6] rounded-[6px] flex items-center justify-center">
                  <p className="font-inter font-medium text-[12px] text-white">
                    Speak to a Representative
                  </p>
                </div>
              </div>
            </div>
            <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
          </div>

          {/* Receiver Message */}
          <div className="flex flex-col w-[188px] h-[58px] bg-[#F3F4F6] rounded-tr-[12px] rounded-tl-[12px] rounded-br-[12px] p-3 gap-2">
            <p className="font-inter font-medium text-[12px] leading-4 text-black">
              Speaking to a Representative
            </p>
            <p className="font-inter font-medium text-[12px] leading-4 text-right text-[#797782]">
              13:34
            </p>
          </div>

          {/* Center Status Divider */}
          <div className="flex items-center w-[518px] h-[23px] mt-5">
            <div className="w-[145px] h-[2px] bg-[#F3F3F3]"></div>
            <div className="flex justify-center items-center w-[221px] h-[23px] bg-[#E9F1FC] rounded-[6px]">
              <p className="font-inter font-medium text-[10px] text-[#557697] leading-4 text-center">
                Chat got taken over by customer service
              </p>
            </div>
            <div className="w-[140px] h-[2px] bg-[#F3F3F3]"></div>
          </div>

          {/* Last Sender */}
          <div className="flex justify-end gap-3 items-end">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col w-[401px] h-[74px] gap-2 p-2.5 bg-[#1D7AD6] rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] text-white">
                <p className="font-inter font-medium text-[12px] leading-4">
                  Hi, this is Alex from Customer Support. I see you're having an
                  issue with your top-up.
                </p>
                <p className="text-right font-inter font-medium text-[12px] leading-4">
                  13:34
                </p>
              </div>
            </div>
            <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
          </div>

          {/* last center div  */}
          <div className="mt-8 flex flex-col rounded-xl justify-between bg-gray-50 w-[512px] h-[144px] border border-[#EDEDED] opacity-100">
            <input
              type="text"
              placeholder='Type "/" to use template message'
              className="m-5 w-[195px] h-[15px] text-[#797782] font-inter font-medium text-[12px] leading-4 rounded px-1 py-0.5 opacity-100 outline-none"
            />

            <div className="w-full flex justify-between items-center">
              {/* left side  */}
              <div className="m-5 w-[100px] h-[16px] flex gap-[12px] opacity-100">
                <button className="cursor-pointer">
                  <img src={Icon1} alt="" className="w-[16px] h-[16px]" />
                </button>
                <button className="cursor-pointer">
                  <img src={Icon2} alt="" className="w-[16px] h-[16px]" />
                </button>
                <button className="cursor-pointer">
                  <img src={Icon3} alt="" className="w-[16px] h-[16px]" />
                </button>
                <button className="cursor-pointer">
                  <img src={Icon4} alt="" className="w-[16px] h-[16px]" />
                </button>
              </div>

              {/* button div  */}
              <button className="cursor-pointer flex items-center m-5 gap-2 justify-center w-[70px] h-[29px] bg-[#1D7AD6] rounded-[6px] opacity-100">
                <h1 className="font-inter font-semibold text-[12px] leading-[14px] text-white">
                  Send
                </h1>

                <img src={SendIcon} alt="" className="w-[16px] h-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side  */}
      <div className="w-[160px] rounded-lg p-2">
        {/* Row 1 */}
        <div className="flex justify-between items-center mb-2">
          {/* Column 1: User Image */}
          <div className="flex items-center gap-2">
            <img src={ChatImage} alt="User" className="w-8 h-8 rounded-full" />
          </div>

          {/* Column 2: User Details */}
          <div className="flex items-center">
            <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] opacity-100">
              User Details
            </h1>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex justify-between items-center">
          {/* Column 1: UID Label */}
          <div>
            <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] opacity-100">
              UID
            </h1>
          </div>

          {/* Column 2: UID Value */}
          <div>
            <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] opacity-100">
              1232191752819541121
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;