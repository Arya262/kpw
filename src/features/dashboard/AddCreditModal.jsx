import React from "react";

const AddCreditModal = ({
  isOpen,
  onClose,
  creditAmount,
  setCreditAmount,
  handlePayment,
  paymentLoading,
  paymentSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center   z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h3 className="text-lg font-semibold mb-2 text-center">Add Credit</h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          Use credits to send messages, access analytics, and unlock premium features.
        </p>

        {paymentSuccess ? (
          <div className="text-green-600 font-bold text-center">
            ✅ Payment Successful!
          </div>
        ) : (
          <>
            {/* Predefined Credit Buttons */}
            <div className="flex justify-between gap-2 mb-4">
              {[100, 200, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`px-3 py-1 rounded border w-full text-sm ${
                    creditAmount == amount
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

            {/* Form */}
            <form onSubmit={handlePayment}>
              <label className="block mb-2 font-medium text-sm">
                Enter Custom Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                className="border px-3 py-2 rounded w-full mb-4"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                required
                disabled={paymentLoading}
              />

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                disabled={paymentLoading || !creditAmount}
              >
                {paymentLoading ? "Processing..." : "Pay Now"}
              </button>
            </form>
          </>
        )}

        {/* Razorpay Security Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Payments are secured by Razorpay 🔐
        </p>
      </div>
    </div>
  );
};

export default AddCreditModal;
