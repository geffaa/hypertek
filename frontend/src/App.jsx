import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";

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
import { CdpIntegrationProvider } from "./context/CdpIntegration";
import SplashScreen from "./Components/Common/SplashScreen";
import Navbar from "./Components/Common/Navbar";
import Footer from "./Components/Common/Footer";
import Loading from "./Components/Common/Loading";
import ChatbotWidget from "./Components/Chatbot/ChatbotWidget";
import LinkWalletPrompt from "./Components/Common/LinkWalletPrompt";

const MAINTENANCE_MODE = false;
const MAINTENANCE_BYPASS_PATH = "/testing";

// Public preview paths — bypass maintenance WITHOUT setting the bypass cookie.
// Visitors can ONLY view these pages; navigating elsewhere shows "Coming Soon".
const PUBLIC_PREVIEW_PATHS = ["/preview", "/waitlist", "/join-waitlist", "/crowdfunding"];

const SPLASH_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

// Returns true if splash should show (inactive for >= 1 hour or never visited).
// Sets window.__splashComplete immediately when splash is NOT needed.
function shouldShowSplash() {
  const last = parseInt(localStorage.getItem("ht_lastActivity") || "0", 10);
  const inactive = Date.now() - last >= SPLASH_COOLDOWN_MS;
  if (!inactive) window.__splashComplete = true;
  return inactive;
}

// Route-level lazy loading — each page is only loaded when first visited
const Home = lazy(() => import("./pages/home"));
const About = lazy(() => import("./pages/about"));
// Original full-site crowdfunding page — re-import & route this when the main
// site relaunches: const Crowdfunding = lazy(() => import("./pages/Crowdfunding"));
const CrowdfundingStandalone = lazy(() => import("./pages/CrowdfundingStandalone"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Signin"));
const ForgotPasswor = lazy(() => import("./pages/ForgotPasswor"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const HypeGamePage = lazy(() => import("./pages/MoreNews"));
const NewsAll = lazy(() => import("./pages/NewsAll"));
const MarketPlace = lazy(() => import("./pages/MarketPlace"));
const NFA = lazy(() => import("./pages/NFA"));
const Land = lazy(() => import("./pages/Land"));
const CategoryMarketplace = lazy(() => import("./pages/CategoryMarketplace"));
const PersonalActivity = lazy(() => import("./pages/PersonalActivity"));
const NoPersonalActivity = lazy(() => import("./pages/NoPersonalActivity"));
const BuyNfa = lazy(() => import("./pages/BuyNfa"));
const Payment = lazy(() => import("./pages/Payment"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const Success = lazy(() => import("./pages/Success"));
const Collect = lazy(() => import("./Components/ProfileSection/Collectible"));
const ProfileCategory = lazy(() => import("./Components/ProfileSection/ProfileCategory"));
const Activity = lazy(() => import("./Components/ProfileSection/Activity"));
const List = lazy(() => import("./Components/ProfileSection/Listing"));
const Edit = lazy(() => import("./Components/ProfileSection/EditProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Waitlist = lazy(() => import("./pages/Waitlist"));
const WaitlistForm = lazy(() => import("./pages/WaitlistForm"));
const WhitepaperPage = lazy(() => import("./pages/WhitepaperPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const DashboardHome = lazy(() => import("./pages/DashboardHome"));
const OfferedReceived = lazy(() => import("./pages/OfferedReceived"));
const NoOffered = lazy(() => import("./pages/NoOffered"));
const WalletConnect = lazy(() => import("./pages/WalletConnect"));
const Wellcome = lazy(() => import("./pages/Wellcome"));
const SigninWallet = lazy(() => import("./pages/SigninWallet"));
const NoItem = lazy(() => import("./pages/NoItem"));
const Stripe = lazy(() => import("./pages/Stripe"));
const Funnel = lazy(() => import("./pages/Funnel"));
const Gaming = lazy(() => import("./pages/Gaming"));
const WalletTest = lazy(() => import("./pages/WalletTest"));
const Nft101Article = lazy(() => import("./pages/Nft101Article"));
const GameModePage = lazy(() => import("./pages/GameModePage"));
const Preview = lazy(() => import("./pages/Preview"));
const PreviewGameMode = lazy(() => import("./pages/PreviewGameMode"));
const PreviewAbout = lazy(() => import("./pages/PreviewAbout"));
const PreviewUI = lazy(() => import("./pages/PreviewUI"));
const DashboardLayout = lazy(() => import("./Layout/DashboardLayout"));
const NFTs = lazy(() => import("./pages/DashboardPages/Nfts"));
const EditColelctions = lazy(() => import("./assets/EditCollection"));
const EditProfile = lazy(() => import("./pages/DashboardPages/EditUser"));
const Transactions = lazy(() => import("./pages/DashboardPages/Transaction"));
const Support = lazy(() => import("./pages/DashboardPages/Support"));
const AddCollection = lazy(() => import("./pages/DashboardPages/AddCollection"));
const CollectionOnSale = lazy(() => import("./pages/DashboardPages/CollectionOnSale"));
const MyOffers = lazy(() => import("./pages/DashboardPages/MyOffers"));
const EditNfa = lazy(() => import("./pages/DashboardPages/EditNfa"));
const AddUserCollection = lazy(() => import("./pages/DashboardPages/AddUserCollection"));
const Withdraw = lazy(() => import("./pages/DashboardPages/Withdraw"));
const UploadNFC = lazy(() => import("./pages/DashboardPages/UploadNFC"));
const TopUp = lazy(() => import("./pages/DashboardPages/TopUp"));

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
    "/crowdfunding",
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
    "/preview",
  ];

  const shouldHideLayout =
    hideLayoutRoutes.includes(location.pathname) ||
    ["/signin", "/signup", "/forgot-password"].includes(location.pathname) ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/preview");

  return (
    <>
      {!shouldHideLayout && <Navbar />}

        <div style={{ flex: 1, position: "relative", zIndex: 20 }}>
          <Suspense fallback={<Loading />}>
          <Routes key={location.pathname}>
            {/* Main Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            {/* Standalone crowdfunding — public preview (bypasses maintenance),
                navbar/footer hidden. Original <Crowdfunding /> kept for the full
                site relaunch. */}
            <Route path="/crowdfunding" element={<CrowdfundingStandalone />} />

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
            <Route path="/payment" element={<Payment />} />
            <Route path="/make-offer" element={<Payment />} />
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
            <Route path="/Activity" element={<Activity />} />
            <Route path="/List" element={<List />} />
            <Route path="/edit" element={<Edit />} />



            {/* Gaming Interface */}
            <Route path="/gaming" element={<Gaming />} />
            {/* Staged CDP wallet smoke test — tester accounts only, redirects home otherwise */}
            <Route path="/wallet-test" element={<WalletTest />} />

            {/* Public Preview — shareable links for social media */}
            <Route path="/preview" element={<Preview />} />
            <Route path="/preview/about" element={<PreviewAbout />} />
            <Route path="/preview/ui" element={<PreviewUI />} />
            <Route path="/preview/:mode" element={<PreviewGameMode />} />
            <Route path="/game/:mode" element={<GameModePage />} />

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
          </Suspense>
        </div>
        <Toaster position="top-right" reverseOrder={false} />
        {!shouldHideLayout && <Footer />}
        {location.pathname !== "/gaming" && <ChatbotWidget />}
        {/* In-context external wallet linking, shown on any page when needed */}
        <LinkWalletPrompt />
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
  const isPublicPreview = PUBLIC_PREVIEW_PATHS.some(p => window.location.pathname.startsWith(p));
  const isLoggedIn = !!localStorage.getItem("token");
  const isBypassed = isBypassPath || isPublicPreview || localStorage.getItem("maintenance_bypass") === "1" || isLoggedIn;

  if (MAINTENANCE_MODE && !isBypassed) {
    // Funnel public visitors to the live Waitlist instead of a dead-end
    // "Coming Soon" screen — the waitlist IS the gate, so no bypass is needed
    // to view or join it. /waitlist & /join-waitlist are public preview paths
    // (see PUBLIC_PREVIEW_PATHS), so this redirect never loops.
    window.location.replace("/waitlist");
    return null;
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
        <CdpIntegrationProvider>
          <EmailWalletProvider>
            <AppWrapper />
          </EmailWalletProvider>
        </CdpIntegrationProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
