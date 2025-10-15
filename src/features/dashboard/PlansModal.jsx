import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Zap, ArrowRight, Plus, Minus } from "lucide-react";

const PlansModal = ({ isOpen, onClose, onPay, userPlan = null }) => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("Basic");
  // const [addonEnabled, setAddonEnabled] = useState(true);
  // const [flows, setFlows] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [billingAddress, setBillingAddress] = useState(null);
  // const [showAddressForm, setShowAddressForm] = useState(false);
  // const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Base monthly plans
  const basePlans = [
    {
      name: "Basic",
      monthlyPrice: 1500,
      popular: false,
      features: [
        "Add Single Contacts (Manual Entry)",
        "Create & Manage Groups",
        "Send Broadcasts (Instant Only)",
        "Use Approved Static Templates",
        "One-on-One Chat (Text, Image, Video, Docs)",
        "Wallet & Transaction Management",
        "Basic Messaging & Campaign Analytics",
        "Up to 1 Agent Login",
        "Email Support",
      ],
    },
    {
      name: "Pro",
      monthlyPrice: 3200,
      popular: true,
      features: [
        "Everything in Basic",
        "Add Bulk Contacts (CSV)",
        "Schedule Broadcasts (Set Date & Time)",
        "Campaign Analytics & Click Tracking",
        "Advanced Dashboard Insights",
        "Multi-Agent Login (Up to 5 Agents)",
        "API & Project Integrations",
        "Priority WhatsApp & Onboarding Support",
      ],
    },
  ];

  // Cycle configurations
  const cycles = {
    monthly: { label: "Monthly", multiplier: 1, discount: 0, period: "/month", renewalMonths: 1, badge: null },
    quarterly: { label: "Quarterly", multiplier: 3, discount: 0.05, period: "/quarter", renewalMonths: 3, badge: "5% Off" },
    yearly: { label: "Yearly", multiplier: 12, discount: 0.1, period: "/year", renewalMonths: 12, badge: "10% Off" },
  };

  const currentCycle = cycles[billingCycle];

  // Compute current plans with adjusted prices
  const currentPlans = basePlans.map((plan) => ({
    ...plan,
    price: Math.round(plan.monthlyPrice * currentCycle.multiplier * (1 - currentCycle.discount)),
    period: currentCycle.period,
  }));

  // // Addon configurations
  // const baseAddonMonthly = 2500;
  // const packAddonMonthly = 1500;

  // // Compute addon price based on flows and cycle
  // let addonPrice = 0;
  // if (addonEnabled) {
  //   const additionalFlows = Math.max(0, flows - 5);
  //   const packs = Math.ceil(additionalFlows / 10);
  //   const monthlyAddon = baseAddonMonthly + packs * packAddonMonthly;
  //   addonPrice = Math.round(monthlyAddon * currentCycle.multiplier * (1 - currentCycle.discount));
  // }

  const selectedPlanData = currentPlans.find((p) => p.name === selectedPlan);
  const totalPrice = (selectedPlanData?.price || 0) /* + addonPrice */;

  useEffect(() => {
    if (isOpen) {
      const previousFocus = document.activeElement;
      const modal = document.getElementById('plans-modal');
      if (modal) modal.focus();

      return () => {
        if (previousFocus && previousFocus.focus) {
          previousFocus.focus();
        }
      };
    }
  }, [isOpen]);

  // useEffect(() => {
  //   if (addonEnabled && flows < 5) {
  //     setFlows(5);
  //   }
  // }, [addonEnabled, flows]);

  useEffect(() => {
    if (userPlan === 'basic' || userPlan === 'pro') {
      setSelectedPlan('Pro');
    } else {
      setSelectedPlan('Basic');
    }
  }, [userPlan]);

  const handlePurchase = async () => {
    // if (!billingAddress) {
    //   setError('Please add a billing address');
    //   return;
    // }

    setIsLoading(true);
    setError(null);

    try {
      // Call the onPay prop with the payment details
      await onPay({
        plan: selectedPlan,
        billingCycle,
        // addonEnabled,
        // flows,
        totalPrice,
        // billingAddress
      });

      onClose(); // Close the modal on success
    } catch (err) {
      setError(err.message || 'Failed to process payment. Please try again.');
      console.error('Purchase error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  const currentDate = new Date();
  const nextRenewal = new Date(currentDate);
  
  const currentDay = currentDate.getDate();
  const targetMonth = currentDate.getMonth() + currentCycle.renewalMonths;
  
  nextRenewal.setMonth(targetMonth, 1); 

  const lastDayOfMonth = new Date(
    nextRenewal.getFullYear(),
    nextRenewal.getMonth() + 1,
    0
  ).getDate();
  
  // Set the day, but don't exceed the last day of the target month
  const renewalDay = Math.min(currentDay, lastDayOfMonth);
  nextRenewal.setDate(renewalDay);
  
  // Format the renewal date string
  const renewalDateStr = `${renewalDay.toString().padStart(2, "0")}/${
    (nextRenewal.getMonth() + 1).toString().padStart(2, "0")
  }/${nextRenewal.getFullYear().toString().slice(-2)}`;

  // Ordinal for renewal day
  const renewalDayWithSuffix = `${renewalDay}${getOrdinalSuffix(renewalDay)}`;

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            id="plans-modal"
            tabIndex="-1"
            className={`bg-white rounded-2xl w-full ${
              userPlan === 'basic' ? 'max-w-2xl' : 'max-w-4xl'
            } h-full max-h-screen flex flex-col overflow-hidden border border-gray-200`}
            style={{
              boxShadow: "0 20px 60px -10px rgba(10, 168, 158, 0.3)",
            }}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex justify-between items-center px-8 py-6 border-b border-gray-200"
              style={{
                background: "linear-gradient(to right, #E6F8F7, #F5FDFC)",
              }}
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select the perfect plan for your business needs
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-5 right-7 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 pt-2 rounded-full transition-colors cursor-pointer bg-gray-100"
                >
                  ×
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-hide">
              {/* Trial Banner - Show for trial users or users without a plan */}
              {!userPlan && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden rounded-xl px-6 py-5"
                  style={{
                    background: "linear-gradient(135deg, #0AA89E, #0DC2B4)",
                    boxShadow: "0 8px 30px -8px rgba(10, 168, 158, 0.4)",
                  }}
                >
                  <div className="absolute top-0 right-0 opacity-10">
                    <Sparkles className="w-32 h-32" />
                  </div>
                  <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-white" />
                        <h3 className="text-white font-bold text-lg">
                          Unlock Everything for 14 Days—Free!
                        </h3>
                      </div>
                      <p className="text-white/90 text-sm">
                        Access Flows and all PRO plan features to elevate your marketing strategy
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        // Handle free trial start logic here
                        // console.log('Starting free trial...');
                      }}
                      className="bg-white text-[#0AA89E] hover:bg-white/90 font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                    >
                      Start Free Trial
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Billing Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`flex justify-center gap-2 bg-gray-100 p-1.5 rounded-xl ${userPlan === 'basic' ? ' mx-auto' : ''}`}
              >
                {Object.entries(cycles).map(([key, { label, badge }]) => (
                  <button
                    key={key}
                    onClick={() => setBillingCycle(key)}
                    className={`flex-1 relative py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${billingCycle === key
                      ? "bg-[#0AA89E] text-white"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
                      }`}
                    style={
                      billingCycle === key
                        ? { boxShadow: "0 4px 20px -4px rgba(10, 168, 158, 0.3)" }
                        : {}
                    }
                  >
                    <span>{label}</span>
                    {badge && (
                      <span
                        className={`ml-1.5 text-xs ${billingCycle === key ? "text-white/90" : "text-[#0AA89E]"
                          }`}
                      >
                        ({badge})
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>

              {/* Plans Grid */}
              <div className={`grid gap-6 ${userPlan === 'basic' ? 'sm:grid-cols-1 max-w-md mx-auto' : 'sm:grid-cols-2'}`}>
                {currentPlans
                  // Filter plans based on user's current plan
                  .filter(plan => {
                    if (userPlan === 'trial' || !userPlan) return true;
                    if (userPlan === 'basic' || userPlan === 'pro') return plan.name === 'Pro'; 
                    return false; 
                  })
                  .map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${selectedPlan === plan.name
                      ? "border-[#0AA89E] bg-[#E6F8F7]"
                      : "border-gray-200 hover:border-[#0AA89E]/50 bg-white"
                      }`}
                    style={
                      selectedPlan === plan.name
                        ? { boxShadow: "0 8px 30px -8px rgba(10, 168, 158, 0.3)" }
                        : {}
                    }
                  >
                    {plan.popular && (
                      <div
                        className="absolute -top-3 right-6 text-white text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          background: "linear-gradient(135deg, #0AA89E, #0DC2B4)",
                          boxShadow: "0 4px 20px -4px rgba(10, 168, 158, 0.3)",
                        }}
                      >
                        POPULAR
                      </div>
                    )}

                    {/* Radio indicator */}
                    <div
                      className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === plan.name
                        ? "border-[#0AA89E] bg-[#0AA89E]"
                        : "border-gray-300"
                        }`}
                    >
                      {selectedPlan === plan.name && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </div>

                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[#0AA89E]">
                        ₹{plan.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600 text-lg">{plan.period}</span>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Check className="w-4 h-4 text-[#0AA89E] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Add-On Section */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`border-2 rounded-xl p-6 transition-all duration-300 ${addonEnabled
                  ? "border-[#0AA89E] bg-[#E6F8F7]"
                  : "border-gray-200 bg-white"
                  }`}
                style={
                  addonEnabled
                    ? { boxShadow: "0 8px 30px -8px rgba(10, 168, 158, 0.3)" }
                    : {}
                }
              >
                ... (addon content)
              </motion.div> */}

              {/* New Section: Billing Address & Payment Method - COMMENTED OUT */}
              {/* <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid gap-6 sm:grid-cols-2"
              >
                <div className="border-2 rounded-xl p-6 transition-all duration-300 border-gray-200 bg-white">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Billing Address
                    </h4>
                    {billingAddress ? (
                      <div className="text-sm text-gray-700">
                        <p>{billingAddress.line1}</p>
                        {billingAddress.line2 && <p>{billingAddress.line2}</p>}
                        <p>{billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}</p>
                        <p>{billingAddress.country}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-red-500 mb-4">
                        Please add your billing address to continue.
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="border border-[#0AA89E] text-[#0AA89E] font-medium px-4 py-2 rounded-lg hover:bg-[#E6F8F7] transition-colors"
                    >
                      {billingAddress ? 'Edit' : 'Add'} Address
                    </button>
                  </div>
                </div>

                <div className="border-2 rounded-xl p-6 transition-all duration-300 border-gray-200 bg-white">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Payment Method
                    </h4>
                    <p className="text-sm text-gray-600">
                      {billingAddress
                        ? "Secure payment processing powered by Razorpay"
                        : "Please add your billing address first"}
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      disabled={!billingAddress || isProcessingPayment}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${billingAddress && !isProcessingPayment
                        ? "bg-[#0AA89E] text-white hover:bg-[#0a9189]"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      onClick={async () => {
                        try {
                          setIsProcessingPayment(true);
                          await new Promise(resolve => setTimeout(resolve, 2000));
                          alert("Payment method added successfully!");
                        } catch (error) {
                          setError("Failed to add payment method. Please try again.");
                        } finally {
                          setIsProcessingPayment(false);
                        }
                      }}
                    >
                      {isProcessingPayment ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Add Card"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div> */}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <p className="text-sm text-gray-600">
                  Renewing every {currentCycle.renewalMonths} month
                  {currentCycle.renewalMonths > 1 ? "s" : ""} on {renewalDayWithSuffix} • Next renewal on {renewalDateStr}
                </p>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#0AA89E]">
                    ₹{totalPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentCycle.period} <span className="text-xs">(Tax Excl.)</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 text-center">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={isLoading /* || isProcessingPayment */}
                className="w-full bg-[#0AA89E] hover:bg-[#0b9a91] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading /* || isProcessingPayment */ ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Purchase Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
      <AnimatePresence>
        {/* Address Form Modal - COMMENTED OUT */}
        {/* {showAddressForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">Add Billing Address</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                setBillingAddress({
                  line1: formData.get('line1'),
                  line2: formData.get('line2'),
                  city: formData.get('city'),
                  state: formData.get('state'),
                  postalCode: formData.get('postalCode'),
                  country: formData.get('country')
                });
                setShowAddressForm(false);
                setError(null);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1*</label>
                    <input
                      type="text"
                      name="line1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AA89E] focus:border-[#0AA89E]"
                      defaultValue={billingAddress?.line1 || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      name="line2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AA89E] focus:border-[#0AA89E]"
                      defaultValue={billingAddress?.line2 || ''}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                      <input
                        type="text"
                        name="city"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AA89E] focus:border-[#0AA89E]"
                        defaultValue={billingAddress?.city || ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                      <input
                        type="text"
                        name="state"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AA89E] focus:border-[#0AA89E]"
                        defaultValue={billingAddress?.state || ''}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code*</label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AA89E] focus:border-[#0AA89E]"
                        defaultValue={billingAddress?.postalCode || ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country*</label>
                      <select
                        name="country"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AA89E] focus:border-[#0AA89E] bg-white"
                        defaultValue={billingAddress?.country || ''}
                      >
                        <option value="" disabled>Select Country</option>
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0AA89E] text-white rounded-lg hover:bg-[#0a9189]"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )} */}
      </AnimatePresence>
    </>
  );
};

export default PlansModal;