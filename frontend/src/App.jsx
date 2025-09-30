import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/home";
import About from "./pages/About";
import Navbar from "./Components/Common/Navbar";
import Footer from "./Components/Common/Footer";
import Signup from "./pages/Signup";
import Login from "./pages/Signin";
import ForgotPasswor from "./pages/ForgotPasswor";
import ResetPassword from "./pages/ResetPassword";
import Loading from "./Components/Common/Loading";

import MarketPlace from "./pages/MarketPlace";
import NFA from "./pages/NFA";
import Land from "./pages/Land";
import PersonalActivity from "./pages/PersonalActivity";
import NoPersonalActivity from "./pages/NoPersonalActivity";

// NFA Pages
import BuyNfa from "./pages/BuyNfa";
import NfaLand from "./pages/NfaLand";
import Payment from "./pages/Payment";
import OfferPage from "./pages/OfferPage";
import ErrorPage from "./pages/ErrorPage";
import Success from "./pages/Success";

// Profile Section
import Collect from "./Components/ProfileSection/Collectible";
import Profile from "./Components/ProfileSection/Land";
import Activity from "./Components/ProfileSection/Activity";
import List from "./Components/ProfileSection/Listing";
import Edit from "./Components/ProfileSection/EditProfile";
import NotFound from "./pages/NotFound";

// Wrapper component to handle route changes
function AppWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loader for 1 second whenever route changes
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location]);

  if (loading) return <Loading />;

  return (
    <>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Auth */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswor />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Marketplace / NFA */}
          <Route path="/market-place" element={<MarketPlace />} />
          <Route path="/nfa-expand" element={<NFA />} />
          <Route path="/land" element={<Land />} />

          {/* NFA Pages */}
          <Route path="/buy-nfa" element={<BuyNfa />} />
          <Route path="/buy-land" element={<NfaLand />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/success" element={<Success />} />
          <Route path="/not-found" element={<NotFound />} />

          {/* Personal Activities */}
          <Route path="/personal-activity" element={<PersonalActivity />} />
          <Route
            path="/no-personal-activity"
            element={<NoPersonalActivity />}
          />

          {/* Profile Section */}
          <Route path="/Profile" element={<Collect />} />
          <Route path="/Lands" element={<Profile />} />
          <Route path="/Activity" element={<Activity />} />
          <Route path="/List" element={<List />} />
          <Route path="/edit" element={<Edit />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <div
      style={{
          background: "#000000",
    backdropFilter: "blur(500px)",     
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </div>
  );
}

export default App;
