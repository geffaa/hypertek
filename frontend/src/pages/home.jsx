import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../Components/home/Hero";
import StorySection from "../Components/home/StorySection";
import News from "../Components/home/News";
import PopularCollections from "../Components/home/PopularCollections";

import { useSelector, useDispatch } from "react-redux";


function Home() {
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return;
    const el = document.getElementById(target);
    if (!el) return;
    const navbarHeight = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top, behavior: "instant" });
  }, [location.state?.scrollTo]);
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
      <StorySection />
      <News />
      <PopularCollections showPageLink />

    </div>
  );
}

export default Home;
