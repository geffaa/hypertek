// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Navbar from "./Components/Common/Navbar";
import Footer from "./Components/Common/Footer";
import About from "./pages/About";
import Signup from "./pages/Signup";
import Login from "./pages/Signin";
import ForgotPasswor from "./pages/ForgotPasswor";
import ResetPassword from "./pages/ResetPassword";

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
        {/* Navbar visible on all pages */}
        <Navbar />

        {/* Main content */}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/signin" element={<Login/>} />
            <Route path="/forgot-password" element={<ForgotPasswor/>} />
            <Route path="/reset-password" element={<ResetPassword/>} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
