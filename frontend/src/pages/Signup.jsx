import React, { useState } from "react";
import Logo from "../assets/images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import CustomButtonLarge from "../Components/Buttons/SignupButton";
import GlowingOrb from "../Components/Common/BgColoring";
import axios from "axios";
import toast from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Basic validations
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 20) {
      toast.error("Password must be between 8 and 20 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`http://localhost:3000/api/v1/user/signup`, {
        Email: formData.email,         // send email instead of FullName
        Password: formData.password,
        ConfirmPassword: formData.confirmPassword
      });

      if (res.status === 201) {
        toast.success("Signup successful!");
        navigate("/signin"); // redirect to signin
      } else {
        toast.error(res.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col relative z-10 items-center justify-center min-h-screen px-4 bg-transparent">
      <GlowingOrb Xaxis={70} Yaxis={150} />
      <GlowingOrb Xaxis={950} Yaxis={450} />

      <div className="rounded-lg flex flex-col items-center justify-center p-8 gap-4 md:w-[412px] max-w-md sm:max-w-sm">
        {/* Logo */}
        <img
          src={Logo}
          alt="Logo"
          className="w-[67px] h-[67px] sm:w-[50px] sm:h-[50px] mb-4"
        />

        <h1 className="text-white text-3xl sm:text-2xl font-bold text-center">
          Create Account
        </h1>

        <p className="text-white text-sm mb-6 text-center">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full pl-10 pr-3 py-3 rounded-2xl border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-white text-white  focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-white text-white  focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-4 flex items-center justify-center text-white font-semibold rounded-lg transition"
          >
            <CustomButtonLarge text="Sign Up" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
