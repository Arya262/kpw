import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getPermissions } from "../../utils/getPermissions";

const ConfirmationDialog = ({ showExitDialog, cancelExit, confirmExit }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") cancelExit();
      if (e.key === "Enter") confirmExit();
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
  }, [showExitDialog, cancelExit, confirmExit]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, [showExitDialog]);

  if (!showExitDialog) return null;

  return (
    <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50">
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
            className="px-3 py-2 w-[70px] bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
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
  const permissions = getPermissions(user);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isCrossHighlighted, setIsCrossHighlighted] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsCrossHighlighted(true);
        setTimeout(() => setIsCrossHighlighted(false), 1000);
      }
    };

    if (isOpen && !paymentLoading) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, paymentLoading]);

  useEffect(() => {
    if (paymentSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, onClose]);

  const handleCloseAndNavigate = () => {
    if (paymentLoading) return;
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
    <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className={`bg-white rounded-lg w-full max-w-sm shadow-lg p-6 relative border transition-all duration-300 ${
          isCrossHighlighted
            ? "border-red-500 animate-pulse"
            : "border-gray-300"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleCloseAndNavigate}
          disabled={paymentLoading}
          className={`absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors ${
            paymentLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
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
            {/* Predefined amounts */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[5000, 10000, 20000, 50000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setCreditAmount(amount)}
                  disabled={paymentLoading}
                  className={`
        relative px-4 py-3 rounded-xl w-full text-base font-medium
        transition-all duration-300 ease-in-out transform
        ${
          creditAmount === amount
            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg scale-105 border-2 border-teal-600"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 hover:scale-105"
        }
        ${paymentLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
                >
                  ₹{amount.toLocaleString()}
                  {creditAmount === amount && (
                    <span className="absolute top-1 right-2 text-xs bg-white text-teal-600 px-2 py-0.5 rounded-full shadow-sm">
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom amount */}
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
                min="1"
                step="1"
                onWheel={(e) => e.currentTarget.blur()} // prevent scroll
                placeholder="e.g., 300 to unlock all features"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                disabled={paymentLoading}
                className="w-full border rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-[#0AA89E] focus:border-[#0AA89E]"
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
                className={`w-full bg-[#0AA89E] text-white py-2 rounded-md font-semibold transition flex items-center justify-center ${
                  paymentLoading ||
                  !creditAmount ||
                  isNaN(creditAmount) ||
                  creditAmount <= 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#099089] cursor-pointer"
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
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-white" />
                    Secure Payment Now
                  </span>
                )}
              </motion.button>
            </form>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-1"
        >
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>100% Secure — Handled by</span>
          <strong className="ml-1">Razorpay</strong>
        </motion.div>
      </div>

      {/* Exit dialog */}
      <ConfirmationDialog
        showExitDialog={showExitDialog}
        cancelExit={cancelExit}
        confirmExit={confirmExit}
      />
    </div>
  );
};

export default AddCreditModal;
