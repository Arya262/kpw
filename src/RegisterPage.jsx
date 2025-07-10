import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import whatsAppLogo from "./assets/whatsappIcon.png";
import { API_ENDPOINTS } from "./config/api";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return !value.trim() ? "Name is required." : "";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Please enter a valid email.";
      case "password":
        return value.length < 6
          ? "Password must be at least 6 characters."
          : "";
      default:
        return "";
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validate = () => {
    const newErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      password: validateField("password", form.password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((err) => err);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await axios.post(API_ENDPOINTS.AUTH.REGISTER, form, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const { success, message } = res.data;
      if (success) {
        toast.success("Account created! You can now log in.");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.error(message || "Something went wrong.");
      }
    } catch {
      toast.error("Failed to create account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-[#adede9] via-[#def7f6] via-[#d4f5f3] to-white p-4">
      <ToastContainer />
      <div className="w-full max-w-[648px] bg-white rounded-xl overflow-hidden shadow-lg flex flex-col">
        {/* Header section with branding */}
        <div className="relative h-[250px] sm:h-[300px] md:h-[352px] w-full bg-[#ceeeec] overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10">
            <div className="w-full sm:w-[360px] mb-4 sm:mb-[296px] mt-6 sm:mt-[50px]">
              <img
                className="h-[45px] w-[128px]"
                src="https://www.foodchow.com/Images/online-order/logo.png"
                alt="Logo"
              />
              <p className="font-poppins text-xl sm:text-2xl md:text-[30px] mb-[15px] font-semibold mt-4 sm:mt-[30px]">
                Foodchow WhatsApp Marketing
              </p>
            </div>

            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
              <div className="relative w-[120px] h-[120px] sm:w-[169px] sm:h-[166px] flex justify-center items-center">
                <img
                  className="w-[60px] h-[60px] sm:w-[76px] sm:h-[76px] relative z-10 mb-[120px] sm:mb-[200px]"
                  src={whatsAppLogo}
                  alt="Social Icon"
                />
              </div>
            </div>
          </div>

          <svg
            className="absolute inset-x-0 bottom-0 w-full h-[80px] sm:h-[110px]"
            viewBox="0 0 1440 450"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,250 C700,-300,1080,700,1440,20 L1440,500 L0,500 Z"
            />
          </svg>
        </div>

        {/* Register Form */}
        <div className="px-6 pb-6 md:px-10 md:pb-10 font-semibold">
          <form onSubmit={handleRegister} className="flex flex-col space-y-5">
            <p className="font-bold font-poppins text-2xl sm:text-[30px]">
              Register
            </p>

            {/* Name */}
            <div className="flex flex-col text-black">
              <label className="text-sm mb-2">Full Name</label>
              <input
                name="name"
                className={`w-full h-[50px] rounded-md px-4 border ${
                  errors.name ? "border-red-500" : "border-[#a2a2a2]"
                }`}
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Full Name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col text-black">
              <label className="text-sm mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                className={`w-full h-[50px] rounded-md px-4 border ${
                  errors.email ? "border-red-500" : "border-[#a2a2a2]"
                }`}
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col relative text-black">
              <label className="text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full h-[50px] rounded-md px-4 border ${
                    errors.password ? "border-red-500" : "border-[#a2a2a2]"
                  }`}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0aa89e] h-[58px] w-full flex items-center justify-center border rounded-xl text-white text-base hover:opacity-90 transition"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-sm text-center">
              Already have an account?{" "}
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
