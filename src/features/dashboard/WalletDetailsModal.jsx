import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Megaphone, Zap, ShieldCheck, Settings } from "lucide-react";

const WalletDetailsModal = ({ isOpen, onClose, walletBalance }) => {
  const categories = [
    { name: "Marketing", price: 0.88, Icon: Megaphone },
    { name: "Utility", price: 0.38, Icon: Zap },
    { name: "Authentication", price: 0.35, Icon: ShieldCheck },
    { name: "Service", price: 0.34, Icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] sm:max-h-[80vh] overflow-y-auto scrollbar-hide"
          >
            {/* Header */}
            <div className="border-b border-gray-100 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-[#0AA89E]" />
                <h2 className="text-xl font-semibold text-gray-800">Wallet & Messages</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6">
              {/* Balance */}
              <div className="rounded-lg p-4 mb-6 bg-[#0bA89E]">
                <p className="text-sm text-white mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-white">
                  ₹{walletBalance.toFixed(2)}
                </p>
              </div>

              {/* Messages Section */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">Message you will get</h3>
                  <p className="text-xs text-gray-500 italic">
                    *Prices are excluding 18% GST
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[400px] border border-gray-300 rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-5 py-3 flex justify-between items-center text-sm font-semibold text-gray-600 border-b">
                      <span className="w-1/3">Category</span>
                      <span className="w-1/3 text-center">*Price Per Message</span>
                      <span className="w-1/3 text-right">Messages</span>
                    </div>

                    {/* Table Body */}
                    {categories.map(({ name, price }, index) => {
                      const messages = Math.floor(walletBalance / price);
                      return (
                        <motion.div
                          key={name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-4 py-2 flex justify-between items-center hover:bg-gray-50 transition-colors"
                        >
                          <span className="w-1/3 font-medium text-gray-800 flex gap-1 items-center">
                            {name}
                          </span>
                          <span className="w-1/3 text-center text-sm text-gray-500">
                            ₹{price.toFixed(2)}/msg
                          </span>
                          <span className="w-1/3 text-right text-gray-800 font-medium">
                            {messages.toLocaleString()}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your recharge balance can be used across all categories in WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#0AA89E] text-white text-sm font-medium rounded-md hover:bg-[#09857d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#09857d] transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WalletDetailsModal;
