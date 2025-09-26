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
import { GrOverview } from "react-icons/gr";

// Wrapper component to handle route changes
function AppWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loader for 1-2 seconds whenever route changes
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
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/overview" element={<GrOverview />} />
          <Route path="/forgot-password" element={<ForgotPasswor />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
        background: "linear-gradient(to bottom, #050404db, #2b3862ff)",
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
