import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROLE_PERMISSIONS } from "../../context/permissions";

const ConfirmationDialog = ({ showExitDialog, cancelExit, confirmExit }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") cancelExit();
    };
    const handleClickOutside = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        cancelExit();
      }
    };

    if (showExitDialog) {
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExitDialog, cancelExit]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  if (!showExitDialog) return null;

  return (
    <div className="fixed inset-0 bg-opacity-5 flex items-center justify-center z-50 transition-opacity duration-300">
      <div
        ref={dialogRef}
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        tabIndex="-1"
      >
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-6 h-6 text-teal-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 id="dialog-title" className="text-lg font-semibold text-gray-800">
            Exit Confirmation
          </h3>
        </div>
        <p id="dialog-message" className="text-gray-600 mb-6">
          Are you sure you want to exit? Your payment progress will be lost.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={cancelExit}
            className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmExit}
            className="px-3 py-2 w-[70px] bg-teal-500 text-white rounded-md hover:bg-teal-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const AddCreditModal = ({
  isOpen,
  onClose,
  creditAmount,
  setCreditAmount,
  handlePayment,
  paymentLoading,
  paymentSuccess,
}) => {
  const { user } = useAuth();
  const role = user?.role || "User";
  const permissions = ROLE_PERMISSIONS[role] || {};
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isCrossHighlighted, setIsCrossHighlighted] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsCrossHighlighted(true);
        setTimeout(() => setIsCrossHighlighted(false), 2000);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (paymentSuccess) {
      const timer = setTimeout(() => {
        onClose(); // auto-close after payment success
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, onClose]);

  const handleCloseAndNavigate = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    onClose();
    setShowExitDialog(false);
    setIsCrossHighlighted(false);
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    setIsCrossHighlighted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 transition-all duration-300">
      <div
        ref={modalRef}
        className={`bg-white rounded-lg w-full max-w-sm shadow-lg p-6 relative border transition-all duration-300 ${isCrossHighlighted
            ? "border-teal-500 border-2 shadow-[0_0_20px_rgba(5,163,163,0.3)]"
            : "border-gray-300"
          }`}
      >
        <button
          onClick={handleCloseAndNavigate}
          disabled={paymentLoading}
          className={`absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors cursor-pointer ${isCrossHighlighted
              ? "bg-red-500 text-white hover:text-white"
              : "bg-gray-100"
            } ${paymentLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          ×
        </button>

        <h3 className="text-lg font-semibold mb-2 text-center">Add Credit</h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          Use credits to send messages, access analytics, and unlock premium
          features.
        </p>

        {paymentSuccess ? (
          <div className="text-green-600 font-bold text-center">
            ✅ Payment Successful!
          </div>
        ) : (
          <>
            <div className="flex justify-between gap-2 mb-4">
              {[500, 1000, 2000, 5000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`px-3 py-1 rounded border w-full text-sm ${creditAmount === amount
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  onClick={() => setCreditAmount(amount)}
                  disabled={paymentLoading}
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!creditAmount || isNaN(creditAmount) || creditAmount <= 0)
                  return;
                handlePayment(e);
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or enter your own amount
              </label>
              <input
                type="number"
                step="1"
                min="1"
                autoFocus={!paymentSuccess}
                placeholder="e.g., 300 to unlock all features"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                disabled={paymentLoading}
                className="w-full border rounded-md px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={
                  paymentLoading ||
                  !creditAmount ||
                  isNaN(creditAmount) ||
                  creditAmount <= 0
                }
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center 
    ${paymentLoading ||
                    !creditAmount ||
                    isNaN(creditAmount) ||
                    creditAmount <= 0
                    ? "opacity-50 cursor-pointer"
                    : "cursor-pointer"
                  }`}
              >
                {paymentLoading ? (
                  <span className="flex items-center gap-2">
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "🔐 Secure Payment Now"
                )}
              </motion.button>
            </form>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-1"
        >
          <ShieldCheck className="w-4 h-4 text-green-500" />
          {"🔒 100% Secure — Handled by "}
          <strong>Razorpay</strong>
        </motion.div>
      </div>

      <ConfirmationDialog
        showExitDialog={showExitDialog}
        cancelExit={cancelExit}
        confirmExit={confirmExit}
      />
    </div>
  );
};

export default AddCreditModal;
