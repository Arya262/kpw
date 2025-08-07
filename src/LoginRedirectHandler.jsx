import React, { useState } from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import whatsAppLogo from "./assets/whatsappIcon.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import axios from "axios";
import { API_ENDPOINTS } from "./config/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./components/Loader";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect already authenticated users
  React.useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "super_admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const [loginMethod, setLoginMethod] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    switch (name) {
      case "loginMethod":
        if (!value.trim()) {
          return "Make sure you enter a valid email address or a 10-digit mobile number.";
        }
        if (!emailRegex.test(value) && !mobileRegex.test(value)) {
          return "Enter a valid email or 10-digit mobile number starting with 6-9.";
        }
        return "";
      case "password":
        if (!value.trim()) {
          return "Please enter your password.";
        }
        if (value.length < 6) {
          return "Password must be at least 6 characters.";
        }
        return "";
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
    if (name === "loginMethod") setLoginMethod(value);
    else if (name === "password") setPassword(value);

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validate = () => {
    const newErrors = {
      loginMethod: validateField("loginMethod", loginMethod),
      password: validateField("password", password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ loginMethod: true, password: true });

    if (!validate()) return;

    try {
      setLoading(true);
      const response = await axios.post(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          email: loginMethod,
          password,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Login response:", response);
      const { success, user, error } = response.data;

      if (success) {
        login(user);

        if (user.role === "admin" || user.role === "super_admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        toast.error(
          error || "Invalid email/mobile or password. Please try again."
        );
      }
    } catch (err) {
      console.error("Login error:", err);

      const backendMsg =
        err.response?.data?.error || err.response?.data?.message || err.message;
      if (backendMsg) {
        toast.error(backendMsg);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-[#adede9] via-[#def7f6] via-[#d4f5f3] to-white ">
      <ToastContainer />
      <div className="w-full h-[620px] m-3  max-w-[548px]  md:max-w-[648px] sm:max-w-[500px] bg-white rounded-xl overflow-hidden shadow-lg flex flex-col ">
        {/* Header */}
        <div className="relative h-[250px] sm:h-[352px] md:h-[352px] w-full bg-[#ceeeec] overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10">
            <div className="w-full sm:w-[360px] mb-4 sm:mb-[296px] mt-6 sm:mt-[40px]">
              <img
                className="h-[40px] w-[110px]"
                src="https://www.foodchow.com/Images/online-order/logo.png"
                alt="Logo"
              />
              <p className="font-poppins text-xl sm:text-xl md:text-[20px] mb-[15px] font-semibold mt-4 sm:mt-[30px]">
                Foodchow WhatsApp Marketing
              </p>
            </div>

            <div className="w-full sm:w-auto flex hidden  sm:block justify-center sm:justify-end">
              <div className="relative w-[120px] h-[120px] sm:w-[169px] sm:h-[166px] flex justify-center items-center">
                <img
                  className="w-[50px] h-[60px] sm:w-[60px] sm:h-[76px] relative z-10 mb-[120px] sm:mb-[200px]"
                  src={whatsAppLogo}
                  alt="Social Icon"
                />
                {/* Add SVG as-is */}
                <svg
                  className="absolute inset-0 w-full h-full "
                  viewBox="0 0 170 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M169.5 116C111.5 169 9.36957 170.319 1.5 160L0.171875 5.60207C20.5197 -1.86736 148.389 -1.86736 166.172 5.60207L169.5 116Z"
                    fill="url(#paint0_linear)"
                  />
                  <path
                    d="M166 6.94531V12.7682C166 16.7405 128.836 19.9453 83 19.9453C37.1642 19.9453 0 16.7405 0 12.7682V6.94531C0 8.25434 4.01373 9.47309 11.0997 10.5113C12.0907 10.6467 13.0818 10.7821 14.1719 10.9175C14.5684 10.9627 14.9152 11.0078 15.3116 11.053C16.5009 11.1884 17.7893 11.3689 19.1272 11.5043C19.4245 11.5495 19.7218 11.5495 20.0687 11.5946C21.4066 11.73 22.8436 11.8654 24.2806 12.0009C24.677 12.046 25.0734 12.046 25.4699 12.0911C27.2537 12.2266 29.0872 12.362 30.9702 12.4974C31.317 12.4974 31.6639 12.5425 32.0108 12.5877C32.9522 12.6328 33.9433 12.7231 34.9343 12.7682C35.3307 12.8134 35.7272 12.8134 36.1731 12.8585C38.0561 12.9939 40.0382 13.0842 42.0699 13.1745C42.8627 13.2196 43.6555 13.2648 44.4484 13.2648C45.2412 13.3099 46.034 13.3099 46.8764 13.355C48.7594 13.4453 50.6424 13.4904 52.6245 13.5807C53.1695 13.5807 53.7146 13.6259 54.2597 13.6259C54.3588 13.6259 54.4579 13.6259 54.557 13.6259C55.3499 13.671 56.1922 13.671 56.9851 13.7161C57.4806 13.7161 57.9266 13.7613 58.4221 13.7613C59.0663 13.7613 59.7105 13.8064 60.3546 13.8064C62.0394 13.8516 63.7737 13.8967 65.4585 13.8967C66.1523 13.8967 66.8955 13.9418 67.5893 13.9418C68.0352 13.9418 68.4812 13.9418 68.9767 13.9418C69.8687 13.9418 70.8102 13.987 71.7517 13.987C75.4681 14.0321 79.234 14.0321 83.0991 14.0321C86.9642 14.0321 90.7301 13.987 94.397 13.987C95.3385 13.987 96.2305 13.9418 97.172 13.9418C97.6179 13.9418 98.1134 13.9418 98.5594 13.9418C99.3027 13.9418 99.9964 13.9418 100.74 13.8967C102.474 13.8516 104.159 13.8516 105.844 13.8064C106.488 13.8064 107.132 13.7613 107.826 13.7613C108.321 13.7613 108.767 13.7161 109.263 13.7161C110.056 13.7161 110.898 13.671 111.691 13.6259C111.74 13.6259 111.839 13.6259 111.889 13.6259C112.484 13.6259 113.029 13.5807 113.574 13.5807C115.506 13.4904 117.439 13.4453 119.272 13.355C120.065 13.3099 120.907 13.2648 121.7 13.2648C122.493 13.2196 123.286 13.1745 124.079 13.1745C126.16 13.0842 128.142 12.9488 130.075 12.8585C130.471 12.8585 130.818 12.8134 131.214 12.7682C132.205 12.7231 133.147 12.6328 134.088 12.5877C134.435 12.5877 134.782 12.5425 135.129 12.4974C135.476 12.4523 135.823 12.4523 136.17 12.4071C141.719 12.0009 146.625 11.5495 150.837 11.053C151.233 11.0078 151.63 10.9627 151.977 10.9175C153.067 10.7821 154.058 10.6467 155.049 10.5113C161.986 9.47309 166 8.25434 166 6.94531Z"
                    fill="url(#paint1_linear)"
                  />

                  <defs>
                    <linearGradient
                      id="paint0_linear"
                      x1="20.1744"
                      y1="53.472"
                      x2="166.191"
                      y2="53.472"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#F4F4F6" />
                      <stop offset="0.0545" stopColor="#FDFDFD" />
                      <stop offset="0.1777" stopColor="white" />
                      <stop offset="0.3344" stopColor="#F5F5F6" />
                      <stop offset="0.4476" stopColor="#EAEAEC" />
                      <stop offset="0.6534" stopColor="#DBDBDD" />
                      <stop offset="0.809" stopColor="#DEDEE0" />
                      <stop offset="0.9175" stopColor="#E7E7E9" />
                      <stop offset="1" stopColor="#F4F4F6" />
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear"
                      x1="0.019"
                      y1="13.4457"
                      x2="166.004"
                      y2="13.4457"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#EFD175" />
                      <stop offset="0.0244" stopColor="#DFB95F" />
                      <stop offset="0.0575" stopColor="#CD9F48" />
                      <stop offset="0.0873" stopColor="#C3903A" />
                      <stop offset="0.1108" stopColor="#BF8A35" />
                      <stop offset="0.141" stopColor="#C5933E" />
                      <stop offset="0.1911" stopColor="#D5AD57" />
                      <stop offset="0.2545" stopColor="#EFD680" />
                      <stop offset="0.2892" stopColor="#FFEF99" />
                      <stop offset="0.4459" stopColor="#FFEF99" />
                      <stop offset="0.465" stopColor="#F2DB85" />
                      <stop offset="0.5027" stopColor="#DCB862" />
                      <stop offset="0.5384" stopColor="#CC9F49" />
                      <stop offset="0.5708" stopColor="#C28F3A" />
                      <stop offset="0.5969" stopColor="#BF8A35" />
                      <stop offset="0.7108" stopColor="#BF8A35" />
                      <stop offset="0.7468" stopColor="#D0A144" />
                      <stop offset="0.7707" stopColor="#D7AB4B" />
                      <stop offset="0.8135" stopColor="#D7AB4B" />
                      <stop offset="0.8501" stopColor="#CE9F43" />
                      <stop offset="0.927" stopColor="#BF8A35" />
                      <stop offset="0.9518" stopColor="#C39039" />
                      <stop offset="0.9843" stopColor="#CFA044" />
                      <stop offset="1" stopColor="#D7AB4B" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Wave */}
          <svg
            className="absolute inset-x-0 bottom-0 w-full h-[70px] sm:h-[50px]"
            viewBox="0 0 1440 450"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,250 C500,-300,1080,1000,1440,20 L1440,500 L0,500 Z"
            />
          </svg>
        </div>

        {/* Login Form */}
        <div className="px-5  pb-6 md:px-10 md:pb-10 font-semibold">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
            <p className="font-bold font-poppins text-2xl sm:text-[28px]">
              Login
            </p>

            {/* Email/Mobile */}
            <div className="flex flex-col text-black">
              <label className="text-sm sm:text-[16px] mb-2">
                Email / Mobile No
              </label>
              <input
                name="loginMethod"
                className={`w-full h-[45px] rounded-md px-4 text-sm sm:text-[16px] ${
                  errors.loginMethod ? "border-red-500" : "border-[#a2a2a2]"
                } border`}
                value={loginMethod}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Email / Mobile No"
              />
              {errors.loginMethod && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.loginMethod}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col relative text-black">
              <label className="text-sm sm:text-[16px] mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  className={`w-full h-[45px] rounded-md px-4 border ${
                    errors.password ? "border-red-500" : "border-[#a2a2a2]"
                  }`}
                  type={showPassword ? "text" : "password"}
                  value={password}
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

            {/* Forgot Password */}
            <div className="flex justify-end text-xs sm:text-sm">
              <Link
                to="#"
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0aa89e] h-[50px] w-full flex items-center justify-center border rounded-xl text-white text-base hover:opacity-90 transition"
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
                  Logging in...
                </div>
              ) : (
                "LOGIN"
              )}
            </button>
            {/* Create Account Link */}
            <div className="text-sm text-center">
              <span className="text-gray-600">Don't have an account?</span>
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate("#")}
              >
                Create one
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;