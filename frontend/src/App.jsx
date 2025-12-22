import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./Redux/Store";
import ProtectedRoute from "./Components/ProtectRoutes";

import Home from "./pages/home";
import About from "./pages/about";
import Navbar from "./Components/Common/Navbar";
import Footer from "./Components/Common/Footer";
import Signup from "./pages/Signup";
import Login from "./pages/Signin";
import ForgotPasswor from "./pages/ForgotPasswor";
import ResetPassword from "./pages/ResetPassword";
import Loading from "./Components/Common/Loading";
import  HypeGamePage from "./pages/MoreNews"

import MarketPlace from "./pages/MarketPlace";
import NFA from "./pages/NFA";
import Land from "./pages/Land";
import PersonalActivity from "./pages/PersonalActivity";
import NoPersonalActivity from "./pages/NoPersonalActivity";
import CreateEarning from "./pages/CreateEarning"

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
import Testing from "./pages/Testing";
import UserDashboard from "./pages/UserDashboard";
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

import DashboardLayout from "./Layout/DashboardLayout";

import CreateCollections from "./pages/DashboardPages/CreateNfa";
import NFAdetails from "./pages/DashboardPages/NFAdetails";
import NFTs from "./pages/DashboardPages/Nfts";
import EditColelctions from "./assets/EditCollection";
import EditProfile from "./pages/DashboardPages/EditUser";
import Transactions from "./pages/DashboardPages/Transaction";
import Support from "./pages/DashboardPages/Support";
import AddCollection from "./pages/DashboardPages/AddCollection";
import CollectionOnSale from "./pages/DashboardPages/CollectionOnSale";
import EditNfa from "./pages/DashboardPages/EditNfa";
import AddUserCollection from "./pages/DashboardPages/AddUserCollection";

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

  // ✅ Routes where Navbar & Footer should be hidden
  const hideLayoutRoutes = [
   
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
    "/dashboard/edit-nfa",
    "/dashboard/add-nfts",
    "/dashboard/add-user-collection",
  ];

  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      <Elements stripe={stripePromise}>
        {!shouldHideLayout && <Navbar />}

        <div style={{ flex: 1 }}>
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            {/* Auth */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswor />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Marketplace / NFA */}
            <Route path="/market-place" element={<MarketPlace />} />
            <Route path="/nfa-expand" element={<NFA />} />
            <Route path="/land" element={<Land />} />
            <Route path="/more-news" element={<HypeGamePage/>} />

            {/* NFA Pages */}
            <Route path="/buy-nfa" element={<BuyNfa />} />
            <Route path="/buy-land" element={<NfaLand />} />
            <Route path="/payment" element={<Payment />} />
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
            <Route path="/Lands" element={<Profile />} />
            <Route path="/Activity" element={<Activity />} />
            <Route path="/List" element={<List />} />
            <Route path="/edit" element={<Edit />} />

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
              <Route index element={<UserDashboard />} />

              {/* Dashboard pages */}
              <Route path="create-nfa" element={<CreateCollections />} />
              <Route path="create-earning" element={< CreateEarning/>} />
              <Route path="nfa-details" element={<NFAdetails />} />
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
              <Route
                path="add-user-collection"
                element={<AddUserCollection />}
              />
            </Route>

            {/* not found page  */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster position="top-right" reverseOrder={false} />
        {!shouldHideLayout && <Footer />}
      </Elements>
    </>
  );
}

function App() {
  return (
    <div
      style={{
        background: `
      radial-gradient(circle at 10% 30%, rgba(8, 1, 33, 0.9) 0%, transparent 70%),
      radial-gradient(circle at 70% 50%, rgba(13, 7, 22, 0.93) 0%, transparent 60%),
      radial-gradient(circle at 50% 90%, rgba(5, 4, 17, 0.96) 0%, transparent 90%),
      #0d0d14
    `,
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
