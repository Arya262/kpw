import { useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const { user } = useAuth();

  // Mock data - replace with actual user subscription data
  const activePlan = {
    name: "Pro Plan",
    status: "FREE TRIAL",
    expiryDate: "13 Nov 2025",
    daysRemaining: 5,
  };

  // Base monthly plans from your application
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
      isCurrent: true,
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
    monthly: { label: "Monthly", multiplier: 1, discount: 0, badge: null },
    quarterly: { label: "Quarterly", multiplier: 3, discount: 0.05, badge: "5% Off" },
    yearly: { label: "Yearly", multiplier: 12, discount: 0.1, badge: "10% Off" },
  };

  const currentCycle = cycles[billingCycle] || cycles.monthly;

  // Compute plans with adjusted prices based on billing cycle
  const plans = basePlans.map((plan) => ({
    ...plan,
    price: Math.round(plan.monthlyPrice * currentCycle.multiplier * (1 - currentCycle.discount)),
    period: currentCycle.multiplier === 1 ? "/month" : currentCycle.multiplier === 3 ? "/quarter" : "/year",
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Plans & Subscription</h1>
          <button className="flex items-center gap-2 text-[#0AA89E] hover:text-[#089086] text-sm font-medium">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Active Plan Card */}
        <div className="bg-gradient-to-r from-[#E6F8F7] to-[#F5FDFC] rounded-lg p-6 mb-8 border border-[#0AA89E]/30">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-[#0AA89E] bg-white px-3 py-1 rounded">
                  ACTIVE PLAN - {activePlan.status}
                </span>
                <span className="text-sm text-gray-600">
                  Free trial valid till {activePlan.expiryDate} ({activePlan.daysRemaining} days)
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">{activePlan.name}</h2>
            </div>
            <button className="bg-[#0AA89E] hover:bg-[#089086] text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition">
              <span className="text-lg">🛒</span>
              Purchase Plan
            </button>
          </div>
        </div>

        {/* All Plans Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Plans</h2>
          
          {/* Billing Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  billingCycle === "monthly"
                    ? "bg-[#0AA89E] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("quarterly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  billingCycle === "quarterly"
                    ? "bg-[#0AA89E] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Quarterly {cycles.quarterly.badge && <span className="text-xs ml-1">({cycles.quarterly.badge})</span>}
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  billingCycle === "yearly"
                    ? "bg-[#0AA89E] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Yearly {cycles.yearly.badge && <span className="text-xs ml-1">({cycles.yearly.badge})</span>}
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative border-2 rounded-lg p-6 ${
                  plan.isCurrent
                    ? "border-[#0AA89E]/30 bg-[#E6F8F7]"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-6">
                    <span className="bg-gradient-to-r from-[#0AA89E] to-[#0DC2B4] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      POPULAR
                    </span>
                  </div>
                )}

                {plan.isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#0AA89E] text-white text-xs font-bold px-3 py-1 rounded-full">
                      Current plan
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{plan.period}</p>
                </div>

                <button
                  className={`w-full py-2.5 rounded-lg font-medium mb-4 transition ${
                    plan.isCurrent
                      ? "bg-[#0AA89E] hover:bg-[#089086] text-white"
                      : "border-2 border-[#0AA89E] text-[#0AA89E] hover:bg-[#E6F8F7]"
                  }`}
                >
                  {plan.isCurrent ? "Purchase Plan" : "Change Plan"}
                </button>

                <div className="border-t border-gray-200 pt-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-[#0AA89E] mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Compare All Features Link */}
          <div className="flex justify-center mt-6">
            <button className="flex items-center gap-2 text-[#0AA89E] hover:text-[#089086] text-sm font-medium">
              Compare all features
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Billing Information Section */}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center py-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Billing Information</h3>
                <p className="text-sm text-gray-500 mt-0.5">Manage your billing information here</p>
              </div>
              <button className="text-[#0AA89E] hover:text-[#089086] text-sm font-medium">
                View Billing Info
              </button>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Invoices</h3>
                <p className="text-sm text-gray-500 mt-0.5">View your past and current invoices here</p>
              </div>
              <button className="text-[#0AA89E] hover:text-[#089086] text-sm font-medium">
                View Invoices
              </button>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Payment Methods</h3>
                <p className="text-sm text-gray-500 mt-0.5">Manage cards and payment options for your subscription billing</p>
              </div>
              <button className="text-[#0AA89E] hover:text-[#089086] text-sm font-medium">
                Manage Payment Methods
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
