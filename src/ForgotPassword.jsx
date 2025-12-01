import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { API_ENDPOINTS } from "./config/api";
import { handleError, USER_MESSAGES } from "./utils/errorHandling";
import { forgotPasswordSchema, validateField } from "./utils/validationSchemas";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation using Zod schema
  const validateInput = (value) => {
    const result = validateField(forgotPasswordSchema.shape.identifier, value);
    return result.error || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateInput(identifier);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(identifier);

      const payload = isEmail ? { email: identifier } : { mobile: identifier };

      const response = await axios.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const { success, message } = response.data;

      if (success) {
        toast.success(message || "Reset link or OTP sent successfully.");
        setIdentifier(""); // clear input
      } else {
        toast.error(message || "No account found with that email or mobile number.");
      }
    } catch (err) {
      console.error("Forgot Password error:", err);
      handleError(err, USER_MESSAGES.LOGIN_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#c6f1f0] to-white p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your registered email or mobile number to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block mb-1 text-sm font-medium">
              Email / Mobile No
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email or mobile number"
              aria-describedby="identifier-error"
            />
            {error && (
              <p id="identifier-error" className="text-red-500 text-sm mt-1">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0aa89e] text-white py-2 rounded-md hover:opacity-90 transition"
          >
            {loading ? "Sending..." : "Send Reset Link / OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
