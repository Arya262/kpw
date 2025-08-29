import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import MessagingAnalytics from "./MessagingAnalytics.jsx";
import { Wallet, Banknote, PiggyBank, Crown, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import AddCreditModal from "./AddCreditModal";
import { getPermissions } from "../../utils/getPermissions";
import { FaWhatsapp } from "react-icons/fa";
import vendor from "../../assets/Vector.png";
import FestivalBanner from "./FestivalBanner";
import WalletDetailsModal from "./WalletDetailsModal.jsx";
import TransactionHistoryModal from "./TransactionHistoryModal.jsx";


const AnimatedNumber = ({ value, duration = 1.2 }) => {
  const count = useMotionValue(0);
  const formatted = useTransform(count, (latest) =>
    Math.floor(latest).toLocaleString()
  );
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: "easeOut",
    });
    const unsubscribe = formatted.on("change", (latest) => setDisplay(latest));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value]);

  return <motion.span>{display}</motion.span>;
};

const DashboardHome = () => {
  const [summary, setSummary] = useState({
    total_credit: 0,
    total_credit_remaining: 0,
    total_credit_consumed: 0,
    plan_type: "N/A",
  });

  const [usageHistory, setUsageHistory] = useState([]);
  const { user } = useAuth();
  const permissions = getPermissions(user);

  const [showAddCredit, setShowAddCredit] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const fetchSummary = async () => {
    try {
      const res = await fetch(
        `${API_ENDPOINTS.CREDIT.GRAPH}?customer_id=${user.customer_id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setSummary({
        total_credit: data.total_credit,
        total_credit_remaining: data.total_credit_remaining,
        total_credit_consumed: data.total_credit_consumed,
        plan_type: "Premium",
      });
      setUsageHistory(data.usage_history || []);
    } catch (err) {
      console.error("Failed to load summary:", err);
    }
  };

  useEffect(() => {
    if (user?.customer_id) fetchSummary();
  }, [user?.customer_id]);

  const total = summary.total_credit;
  const used = summary.total_credit_consumed;
  const remaining = Math.max(0, total - used);
  const stats = [
    {
      title: "Total Credit",
      icon: Wallet,
      value: summary.total_credit,
      gradient: "bg-gradient-to-b from-blue-400 to-blue-800",
    },
    {
      title: "Used Credit",
      icon: Banknote,
      value: summary.total_credit_consumed,
      gradient: "bg-gradient-to-b from-orange-400 to-yellow-500",
    },
    {
      title: "Remaining Credit",
      icon: PiggyBank,
      value: remaining,
      gradient: "bg-gradient-to-b from-green-400 to-green-900",
    },
    {
      title: "Plan Type",
      icon: Crown,
      value: summary.plan_type,
      gradient: "bg-gradient-to-b from-purple-400 to-purple-700",
    },
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        )
      ) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load.");
      setPaymentLoading(false);
      return;
    }

    const amountInRupees = parseFloat(creditAmount);
    if (isNaN(amountInRupees) || amountInRupees <= 0) {
      alert("Please enter a valid credit amount.");
      setPaymentLoading(false);
      return;
    }

    try {
      const orderRes = await fetch(API_ENDPOINTS.RAZORPAY.CREATE_ORDER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInRupees,
          customer_id: user.customer_id,
        }),
      });

      const { order } = await orderRes.json();

      const options = {
        key: "rzp_live_MoWUoTrGF0woCD",
        amount: order.amount,
        currency: "INR",
        name: user?.company_name || "FoodChow",
        image: user?.company_logo || undefined,
        description: "Add Credit",
        order_id: order.id,
        handler: async (response) => {
          await fetch(API_ENDPOINTS.RAZORPAY.VERIFY_PAYMENT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          setPaymentSuccess(true);
          setPaymentLoading(false);
          fetchSummary();
        },
        prefill: {
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#0AA89E" },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment initiation failed.");
      console.error(err);
      setPaymentLoading(false);
    }
  };

  const handleUnauthorizedAddCredit = () => {
    toast.error("You do not have permission to add credits.");
  };

  return (
    <div>
      <FestivalBanner />
      <div className="flex justify-between items-center mb-6 gap-4 px-4 pt-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Dashboard
        </h2>
        <button
          className="bg-[#0AA89E] hover:bg-[#0AA89E] text-white flex items-center gap-2 px-4 py-2 rounded cursor-pointer"
          onClick={
            permissions.canAddCredits
              ? () => setShowAddCredit(true)
              : handleUnauthorizedAddCredit
          }
        >
          <img src={vendor} alt="plus sign" className="w-5 h-5" />
          Add Credit
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 mx-7">
        {stats.map(({ title, icon: Icon, value, gradient }, i) => (
          <motion.div
            key={title}
            className={`p-6 rounded-xl text-white shadow-md transform transition-transform duration-300 hover:-translate-y-1 text-left sm:text-center relative ${gradient}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 + i * 0.1 }}
          >
            <div className="mb-3 flex justify-center">
              <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-xl font-bold">
              {typeof value === "number" ? (
                <AnimatedNumber value={value} />
              ) : (
                value
              )}
            </p>
          </motion.div>
        ))}
      </div>
      {/* Wallet Balance Card */}
      <motion.div
        className="p-6 rounded-xl bg-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 col-span-1 sm:col-span-2 lg:col-span-4 mt-6 mx-7"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Wallet Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-lg font-semibold">
            Wallet balance:{" "}
            <span className="font-bold text-green-600">
              ₹{summary.total_credit_remaining.toLocaleString()}
            </span>
          </p>
          <span className="flex items-center text-sm text-gray-600">
            <FaWhatsapp className="text-green-500 mr-1" />
            Good for{" "}
            <strong>
              {/* {Math.floor(summary.total_credit_remaining / 1.038)} */}
            </strong>{" "}
            marketing messages.{" "}
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowWalletDetails(true);
              }}
              className="text-blue-500 hover:underline"
            >
              View details
            </button>
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={
              permissions.canAddCredits
                ? () => setShowAddCredit(true)
                : handleUnauthorizedAddCredit
            }
            className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            ₹ Top–up
          </button>
          <button 
            onClick={() => setShowTransactionHistory(true)}
            className="px-4 py-2 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            ⟳ History
          </button>
        </div>
      </motion.div>
      <motion.div
        className="mt-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {permissions.canViewAnalytics ? (
          <MessagingAnalytics usageHistory={usageHistory} />
        ) : (
          <div className="text-center text-gray-500 py-8">
            You do not have access to detailed analytics.
          </div>
        )}
      </motion.div>
      {permissions.canAddCredits && (
        <AddCreditModal
          isOpen={showAddCredit}
          onClose={() => {
            setShowAddCredit(false);
            setCreditAmount("");
            setPaymentSuccess(false);
            setPaymentLoading(false);
          }}
          creditAmount={creditAmount}
          setCreditAmount={setCreditAmount}
          handlePayment={handlePayment}
          paymentLoading={paymentLoading}
          paymentSuccess={paymentSuccess}
        />
      )}
      <WalletDetailsModal
        isOpen={showWalletDetails}
        onClose={() => setShowWalletDetails(false)}
        walletBalance={summary.total_credit_remaining}
      />
      <TransactionHistoryModal
        isOpen={showTransactionHistory}
        onClose={() => setShowTransactionHistory(false)}
      />
    </div>
  );
};

export default DashboardHome;
