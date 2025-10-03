import React from "react";
import Hero from "../Components/home/Hero";
import HyperTek from "../Components/home/aboutHyperTek";
import News from "../Components/home/News";
import HowItsWork from "../Components/home/HowItsWork";
import PopularCollections from "../Components/home/PopularCollections";
import MarketPlace from "../Components/home/MarketPlace";
import { useSelector, useDispatch } from "react-redux";


function Home() {
 const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
//  console.log("your home login user name :",user);
//  console.log("your home  login user token :",token);
//  console.log("your home login user isloggedin user:",isLoggedInUser);


  return (
    <div
      style={{
        // background: "linear-gradient(to bottom, #050404db, #2b3862ff)",
        minHeight: "100vh",
      }}
    >
       <Hero />
      <HyperTek />
      <News />
      <HowItsWork/>
      <PopularCollections/>
      <MarketPlace/> 
      
    </div>
  );
}

export default Home;
