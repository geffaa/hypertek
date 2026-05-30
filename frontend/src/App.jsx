import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./Redux/Store";
import ProtectedRoute from "./Components/ProtectRoutes";
import { EmailWalletProvider } from "./context/EmailWalletContext";
import Maintenance from "./pages/Maintenance";
import SplashScreen from "./Components/Common/SplashScreen";

const MAINTENANCE_MODE = true;
const MAINTENANCE_BYPASS_PATH = "/testing";

const SPLASH_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

// Returns true if splash should show (inactive for >= 1 hour or never visited).
// Sets window.__splashComplete immediately when splash is NOT needed.
function shouldShowSplash() {
  const last = parseInt(localStorage.getItem("ht_lastActivity") || "0", 10);
  const inactive = Date.now() - last >= SPLASH_COOLDOWN_MS;
  if (!inactive) window.__splashComplete = true;
  return inactive;
}

import Home from "./pages/home";
import About from "./pages/about";
import Navbar from "./Components/Common/Navbar";
import Footer from "./Components/Common/Footer";
import Signup from "./pages/Signup";
import Login from "./pages/Signin";
import ForgotPasswor from "./pages/ForgotPasswor";
import ResetPassword from "./pages/ResetPassword";
import Loading from "./Components/Common/Loading";
import HypeGamePage from "./pages/MoreNews";
import NewsAll from "./pages/NewsAll";


import MarketPlace from "./pages/MarketPlace";
import NFA from "./pages/NFA";
import Land from "./pages/Land";
import CategoryMarketplace from "./pages/CategoryMarketplace";
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
import ProfileCategory from "./Components/ProfileSection/ProfileCategory";
import Activity from "./Components/ProfileSection/Activity";
import List from "./Components/ProfileSection/Listing";
import Edit from "./Components/ProfileSection/EditProfile";
import NotFound from "./pages/NotFound";
import Waitlist from "./pages/Waitlist";
import WaitlistForm from "./pages/WaitlistForm";
import WhitepaperPage from "./pages/WhitepaperPage";
import TermsPage from "./pages/TermsPage";
import Testing from "./pages/Testing";
import DashboardHome from "./pages/DashboardHome";
import OfferedReceived from "./pages/OfferedReceived";
import NoOffered from "./pages/NoOffered";
import WalletConnect from "./pages/WalletConnect";
import Wellcome from "./pages/Wellcome";
import SigninWallet from "./pages/SigninWallet";
import NoItem from "./pages/NoItem";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "./Config";
import { Elements } from "@stripe/react-stripe-js";
import Stripe from "./pages/Stripe";
import Funnel from "./pages/Funnel";
import Gaming from "./pages/Gaming";
import Nft101Article from "./pages/Nft101Article";
import GameModePage from "./pages/GameModePage";

import DashboardLayout from "./Layout/DashboardLayout";
import ChatbotWidget from "./Components/Chatbot/ChatbotWidget";

import NFTs from "./pages/DashboardPages/Nfts";
import EditColelctions from "./assets/EditCollection";
import EditProfile from "./pages/DashboardPages/EditUser";
import Transactions from "./pages/DashboardPages/Transaction";
import Support from "./pages/DashboardPages/Support";
import AddCollection from "./pages/DashboardPages/AddCollection";
import CollectionOnSale from "./pages/DashboardPages/CollectionOnSale";
import MyOffers from "./pages/DashboardPages/MyOffers";
import EditNfa from "./pages/DashboardPages/EditNfa";
import AddUserCollection from "./pages/DashboardPages/AddUserCollection";
import Withdraw from "./pages/DashboardPages/Withdraw";
import UploadNFC from "./pages/DashboardPages/UploadNFC";
import TopUp from "./pages/DashboardPages/TopUp";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Wrapper component to handle route changes
function AppWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Routes where you want to show the loader
  const loadingRoutes = ["/home"];

  useEffect(() => {
    if (loadingRoutes.includes(location.pathname)) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 1000); // 1 second loading
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [location]);

  if (loading) return <Loading />;

  // Routes where Navbar & Footer should be hidden
  const hideLayoutRoutes = [
    "/waitlist",
    "/join-waitlist",
    "/dashboard/create-earning",
    "/stripe-payment",
    "/dashboard",
    "/dashboard/create-nfa",
    "/dashboard/nfa-details",
    "/dashboard/collections",
    "/dashboard/edit-collection-item",
    "/dashboard/edit-profile",
    "/dashboard/transactions",
    "/dashboard/support",
    "/dashboard/add-collection",
    "/dashboard/collection-on-sale",
    "/dashboard/my-offers",
    "/dashboard/edit-nfa",
    "/dashboard/add-nfts",
    "/dashboard/add-user-collection",
    "/dashboard/withdraw",
    "/dashboard/topup",
    "/dashboard/upload-nfc",
    "/gaming",
  ];

  const shouldHideLayout =
    hideLayoutRoutes.includes(location.pathname) ||
    ["/signin", "/signup", "/forgot-password"].includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  return (
    <>
      <Elements stripe={stripePromise}>
        {!shouldHideLayout && <Navbar />}

        <div style={{ flex: 1, position: "relative", zIndex: 20 }}>
          <Routes key={location.pathname}>
            {/* Main Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            {/* Auth */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswor />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Marketplace / NFA */}
            <Route path="/waitlist" element={<Waitlist />} />
            <Route path="/join-waitlist" element={<WaitlistForm />} />
            <Route path="/whitepapers" element={<WhitepaperPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/market-place" element={<MarketPlace />} />
            <Route path="/collections" element={<CategoryMarketplace />} />
            <Route path="/collections/:category" element={<CategoryMarketplace />} />
            <Route path="/nfa-expand" element={<NFA />} />
            <Route path="/land" element={<Land />} />
            <Route path="/more-news" element={<HypeGamePage />} />
            <Route path="/news" element={<NewsAll />} />
            <Route path="/learn/:id" element={<Nft101Article />} />


            {/* NFA Pages */}
            <Route path="/buy-nfa" element={<BuyNfa />} />
            <Route path="/buy-land" element={<NfaLand />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/make-offer" element={<Payment />} />
            <Route path="/offer" element={<OfferPage />} />
            <Route path="/offer-recieved" element={<OfferedReceived />} />

            {/* added this new page  */}
            <Route path="/no-offer" element={<NoOffered />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/success" element={<Success />} />

            {/* new page added i will update it according to the flow  */}
            <Route path="/wallet-connect" element={<WalletConnect />} />
            <Route path="/wellcome" element={<Wellcome />} />
            <Route path="/Signin-wallet" element={<SigninWallet />} />
            <Route path="/no-item-profile" element={<NoItem />} />

            {/* Personal Activities */}
            <Route path="/personal-activity" element={<PersonalActivity />} />
            <Route
              path="/no-personal-activity"
              element={<NoPersonalActivity />}
            />

            {/* Profile Section */}
            <Route path="/Profile" element={<Collect />} />
            <Route path="/profile/:category" element={<ProfileCategory />} />
            <Route path="/Lands" element={<Profile />} />
            <Route path="/Activity" element={<Activity />} />
            <Route path="/List" element={<List />} />
            <Route path="/edit" element={<Edit />} />



            {/* Gaming Interface */}
            <Route path="/gaming" element={<Gaming />} />
            <Route path="/game/:mode" element={<GameModePage />} />

            {/* Testing Routes  */}
            <Route path="/testing" element={<Testing />} />

            {/* for payment options  */}

            <Route path="/stripe-payment" element={<Stripe />} />
            <Route path="/funnel-page" element={<Funnel />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Default dashboard home */}
              <Route index element={<DashboardHome />} />

              {/* Dashboard pages */}
              <Route path="create-nfa" element={<Navigate to="/dashboard/add-user-collection" replace />} />
              <Route path="create-earning" element={<Navigate to="/dashboard/add-user-collection" replace />} />
              <Route path="nfa-details" element={<Navigate to="/dashboard/add-user-collection" replace />} />
              <Route path="edit-nfa" element={<EditNfa />} />
              <Route path="collections" element={<NFTs />} />
              <Route
                path="edit-collection-item"
                element={<EditColelctions />}
              />
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="support" element={<Support />} />
              <Route path="add-nfts" element={<AddCollection />} />
              <Route path="collection-on-sale" element={<CollectionOnSale />} />
              <Route path="my-offers" element={<MyOffers />} />
              <Route
                path="add-user-collection"
                element={<AddUserCollection />}
              />
              <Route path="withdraw" element={<Withdraw />} />
              <Route path="topup" element={<TopUp />} />
              <Route path="upload-nfc" element={<UploadNFC />} />
            </Route>

            {/* Maintenance bypass — accessible even when maintenance mode is on */}
            <Route path="/testing" element={<Navigate to="/" replace />} />

            {/* not found page  */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster position="top-right" reverseOrder={false} />
        {!shouldHideLayout && <Footer />}
      </Elements>
      {location.pathname !== "/gaming" && <ChatbotWidget />}
    </>
  );
}

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [showSplash, setShowSplash] = useState(() => shouldShowSplash());

  // Track user activity to reset the 1-hour inactivity cooldown
  useEffect(() => {
    const updateActivity = () =>
      localStorage.setItem("ht_lastActivity", Date.now().toString());
    const events = ["click", "scroll", "keydown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, updateActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, updateActivity));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSplashDone = () => {
    localStorage.setItem("ht_lastActivity", Date.now().toString());
    window.__splashComplete = true;
    window.dispatchEvent(new Event("splashComplete"));
    setShowSplash(false);
  };

  const isBypassPath = window.location.pathname.startsWith(MAINTENANCE_BYPASS_PATH);
  if (isBypassPath) localStorage.setItem("maintenance_bypass", "1");
  const isLoggedIn = !!localStorage.getItem("token");
  const isBypassed = isBypassPath || localStorage.getItem("maintenance_bypass") === "1" || isLoggedIn;

  if (MAINTENANCE_MODE && !isBypassed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Maintenance />
      </div>
    );
  }

  // Subtle parallax: orbs slowly drift as user scrolls
  const driftX = scrollY * 0.04;
  const driftY = scrollY * 0.06;

  return (
    <div
      style={{
        background: "#060610",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "clip",
      }}
    >
      {/* Glow orb top-left — drifts right+down on scroll */}
      <div
        style={{
          position: "fixed",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "rgba(0, 42, 168, 0.25)",
          filter: "blur(500px)",
          top: "-10%",
          left: "-10%",
          pointerEvents: "none",
          zIndex: 0,
          transform: `translate(${driftX}px, ${driftY}px)`,
          transition: "transform 0.1s linear",
        }}
      />
      {/* Glow orb bottom-right — drifts left+up on scroll */}
      <div
        style={{
          position: "fixed",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "rgba(0, 42, 168, 0.25)",
          filter: "blur(500px)",
          bottom: "-10%",
          right: "-10%",
          pointerEvents: "none",
          zIndex: 0,
          transform: `translate(-${driftX}px, -${driftY}px)`,
          transition: "transform 0.1s linear",
        }}
      />
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <BrowserRouter>
        <ScrollToTop />
        <EmailWalletProvider>
          <AppWrapper />
        </EmailWalletProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
