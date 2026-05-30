import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../Redux/AuthSlice";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { BACKEND_BASE_URL } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner";
import AuthLayout from "../Components/Common/AuthLayout";
import { useTranslation } from "react-i18next";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (formData.password.length < 8 || formData.password.length > 20) {
      toast.error("Password must be between 8 and 20 characters");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/user/login`, {
        Email: formData.email,
        Password: formData.password,
      });
      const { user, token } = res.data || {};
      localStorage.setItem("authData", JSON.stringify(res.data));
      dispatch(loginSuccess({ user, token, isLoggedInUser: true }));
      if (token) localStorage.setItem("token", token);
      if (user?.Role) localStorage.setItem("role", user.Role);
      if (user?.FullName && !localStorage.getItem("hypertek_display_name")) {
        localStorage.setItem("hypertek_display_name", user.FullName.trim().toUpperCase());
      }

      if (user?.Role === "admin") {
        const adminBaseUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5174";
        const adminUrl = new URL(`${adminBaseUrl}/${user.id}`);
        if (token) adminUrl.searchParams.set("token", token);
        toast.success("Admin login successful!");
        window.location.href = adminUrl.toString();
      } else {
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || (err.message === "Network Error" ? "Network Error: Could not connect to the server." : "An unexpected error occurred during login.");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {loading && <FullScreenLoader />}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold">{t("auth.signIn")}</h1>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="relative">
          <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-base" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("auth.emailPlaceholder")}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/60 transition-all text-sm"
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t("auth.passwordPlaceholder")}
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/60 transition-all text-sm"
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Forgot password */}
        <div className="text-right -mt-1">
          <Link to="/forgot-password" className="text-white/50 hover:text-white text-xs transition-colors">
            {t("auth.forgotPassword")}
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-2 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 border border-white/10 text-sm"
        >
          {loading ? t("auth.signingIn") : t("auth.signInBtn")}
        </button>
      </form>

      {/* Don't have account */}
      <p className="text-white/50 text-sm text-center mt-4">
        {t("auth.noAccount")}{" "}
        <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          {t("auth.signUpLink")}
        </Link>
      </p>

    </AuthLayout>
  );
}

export default Login;
