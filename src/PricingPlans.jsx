import { Check, X } from "lucide-react";
import React, { useState } from "react";
import { BsQuestionCircle } from "react-icons/bs";

const PricingPlans = () => {
 const [billingCycle, setBillingCycle] = useState("monthly");
 const [selectedPlan, setSelectedPlan] = useState("Pro");

 const plans = [
  {
   name: "Growth",
   priceMonthly: 1999,
   priceAnnual: (1999 * 12 * 0.75) / 12,
   bgColor: "bg-blue-50",
   buttonColor: "bg-blue-400 hover:bg-blue-500",
   textColor: "text-blue-600",
   borderColor: "border-blue-600",
   users: "3 ",
   note: "No additional users",
   compareValue: [
    true,
    true,
    true,
    "add on",
    true,
    true,
    false,
    false,
    false,
    "2",
    "30",
    false,
   ],
   features: [
    {
     title: "Zero-fee WhatsApp setup: ",
     des: "Get Official WhatsApp API, Blue Tick Verification help",
    },
    {
     title: "Omnichannel inbox:",
     des: " WhatsApp, FB, Instagram, QR code, widget, wa.me",
    },
    {
     title: "Standard promotions:",
     des: " Run multi-media campaigns, view open & read rates",
    },
    {
     title: "Acquire leads: ",
     des: "Launch CTWA ads and capture leads on WhatsApp",
    },
    {
     title: "Team inbox:",
     des: "Assign, track, automate follow-ups, tag & report",
    },
    {
     title: "24x5 Email Support: ",
     des: " In English and Portuguese, with basic SLA coverage",
    },
   ],

   usage: [
    "15k Broadcasts/month, Standard rates",
    "1,000 Free Automation triggers/month",
    "10k API calls/month, No Webhooks",
   ],
  },
  {
   name: "Pro",
   priceMonthly: 4499,
   priceAnnual: (4499 * 12 * 0.75) / 12,
   bgColor: "bg-teal-50",
   buttonColor: "bg-green-400 hover:bg-green-500",
   textColor: "text-green-600",
   borderColor: "border-green-600",
   bestValue: true,
   features: [
    {
     title: "Everything in Growth, plus:",
     des: "",
    },
    {
     title: "Auto-qualify leads: ",
     des: " Advanced chatbots, forms, integrations & IG automation",
    },
    {
     title: "Boost conversions:",
     des: " Smart retargeting, Carousel template & Catalog pay options",
    },
    {
     title: "Optimize Campaigns: ",
     des: " CTWA source tags, click tracking & engagement insights",
    },
    {
     title: "AI Automation: ",
     des: " Answer queries, collect information, send reminders & more",
    },
    {
     title: "Advanced team inbox: ",
     des: " Teams, auto routing, and operator reports",
    },
    {
     title: "Drive Shopify sales: ",
     des: "Campaign based on buyer data, Shopify/Glowik checkout",
    },
    {
     title: "24x7 Email & Chat Support: ",
     des: " Standard SLAs to support your operations",
    },
   ],
   compareValue: [
    true,
    true,
    false,
    "add on",
    true,
    true,
    true,
    false,
    false,
    "Unlimited",
    "Unlimited",
    true,
   ],
   usage: [
    "Unlimited Broadcasts, Standard rates",
    "2,000 Free Automation triggers/month",
    "5 Integrations incl. HubSpot",
    "200k API calls/month, Limited Webhooks",
    "250 Free AI Support Agent replies/month",
   ],
   users: "5 ",
   note: "Additional Users @ ₹1299/User/month",
  },
  {
   name: "Business",
   priceMonthly: 13499,
   priceAnnual: (13499 * 12 * 0.75) / 12,
   bgColor: "bg-pink-50",
   buttonColor: "bg-pink-400 hover:bg-pink-500",
   textColor: "text-pink-600",
   borderColor: "border-pink-600",
   features: [
    {
     title: "Everything in Growth, plus:",
     des: "",
    },
    {
     title: "Scale effortlessly:",
     des: " Send 4k messages/min, get volume discounts & SMS fallback",
    },
    {
     title: "G Official Google Partner: ",
     des: "Asia's only Google Ads to WhatsApp provider",
    },
    {
     title: "Best-in-class ROI:",
     des: " Optimize CTWA ads, track conversion, use WhatsApp Pay API",
    },
    {
     title: "Run teams smoothly: ",
     des: " Multiple WhatsApp numbers & round-robin chat assignment",
    },
    {
     title: "Dedicated Customer Success",
     des: " Manager for strategic recommendations",
    },
    {
     title: "Enhance privacy & compliance: ",
     des: "Phone number masking, Roles & IP Whitelisting",
    },
    {
     title: "Priority 24x7 Email & Chat support,",
     des: " with access to paid TAM services",
    },
   ],
   compareValue: [
    true,
    false,
    true,
    "add on",
    true,
    true,
    true,
    true,
    true,
    "Unlimited",
    "Unlimited",
    true,
   ],
   usage: [
    "Unlimited Broadcasts, Volume discounts",
    "5,000 Free Automation triggers/month",
    "Unlimited integrations incl. Salesforce",
    "20M API calls/month, Extensive Webhooks",
    "1000 Free AI Support Agent replies/month",
    "Blitz add-on: Send 12k messages/min",
   ],
   users: "5",
   note: "Additional Users @ ₹899/User/month",
  },
 ];

 const compareFeature = [
  "Official WhatsApp API",
  "WhatsApp Blue Tick Verification Assistance",
  "Website Chat Widget",
  "Custom Domain",
  "Import and Export Contacts",
  "Custom contact attributes",
  "Shared Inbox",
  "Quick Replies",
  "Business Hours",
  "Chatbots",
  "Keyword Actions & Attributes Rules",
  "Chatbot data enrichment",
 ];

 const getPrice = (plan) =>
  billingCycle === "monthly"
   ? `₹${plan.priceMonthly}`
   : `₹${plan.priceAnnual.toFixed(0)}`;

 return (
  <>
   {/* hero content */}
   <section className="w-full flex flex-col items-center py-12 bg-white border-b border-b-gray-300">
    <div className="max-w-5xl mx-auto px-6 py-20 text-center ">
     <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
      Clear, Affordable <span className="text-teal-500">Plans</span> for
      WhatsApp Scheduling
     </h1>
     <p className="text-lg text-gray-600 max-w-3xl mx-auto ">
      SendOnTime helps you schedule messages and statuses reliably—without
      needing to stay online. Choose the plan that matches your workflow
      and get started today.
     </p>
     {/* <div className="flex items-center"><button >Get started Now</button> <BiRightArrowAlt/></div> */}
    </div>
   </section>
   {/* Pricing Plans Section */}
   <section className="w-full flex flex-col items-center py-20 bg-white">
    {/* Header */}
    <div className="text-center max-w-3xl mb-10 mt-10">
     <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
      <span className="text-teal-500">Flexible</span> plans to fit your
      needs
     </h1>
     {/* <h2 className="text-teal-600 font-semibold text-lg">
      Get great features at a price that makes sense
     </h2> */}
     <h1 className="text-xl font-bold text-gray-700 mt-2">
      Affordable pricing with zero setup fees
     </h1>
     <p className="text-gray-500 mt-2">
      Up to <span className="font-bold">25% off</span> & free dedicated
      onboarding with annual subscription
     </p>
     {/* Billing Toggle */}
     <div className="inline-flex items-center bg-white rounded-full p-1 shadow-md mb-8 mt-10">
      <button
       onClick={() => setBillingCycle("monthly")}
       className={`px-6 py-3 rounded-full font-medium text-sm ${
        billingCycle === "monthly"
         ? "bg-teal-500 text-white"
         : "text-gray-600"
       }`}
      >
       Monthly
      </button>
      <button
       onClick={() => setBillingCycle("annual")}
       className={`px-6 py-3 rounded-full font-medium text-sm ${
        billingCycle === "annual"
         ? "bg-teal-500 text-white"
         : "text-gray-600"
       }`}
      >
       Annual
      </button>
     </div>
    </div>

    {/* Pricing Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-w-7xl items-stretch">
     {plans.map((plan) => (
      <div
       key={plan.name}
       className="flex flex-col w-full h-full p-3 overflow-visible"
      >
       <div
        onClick={() => setSelectedPlan(plan.name)}
        className={`relative flex flex-col justify-between rounded-xl shadow-lg p-8 w-full h-full transition-transform duration-300 cursor-pointer ${
         plan.bgColor
        } border-1 ${
         selectedPlan === plan.name
          ? `${plan.borderColor} scale-102`
          : "border-transparent"
        }`}
       >
        {plan.bestValue && (
         <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
          Best Value
         </span>
        )}
        <div className="space-y-1">
         <h3 className="text-xl font-bold text-gray-800">
          {plan.name}
         </h3>
         <p
          className={`text-3xl font-extrabold mt-2 ${plan.textColor}`}
         >
          {getPrice(plan)}
          <span className="text-base font-normal"> /month</span>
         </p>
         <p className="text-gray-500 text-md font-bold">
          {plan.users} Users Included
         </p>
         <p className="text-sm text-gray-400 mb-4">{plan.note}</p>
         {/* <button
          className={`w-full mt-6 py-3 font-semibold rounded-lg ${
           selectedPlan === plan.name
            ? "bg-[#00E785] text-white"
            : `${plan.buttonColor} text-white`
          }`}
         >
          {selectedPlan === plan.name ? "Selected" : "Select Plan"}
         </button> */}

         <div className="mt-6 h-110 border-b border-b-gray-300">
          <h4 className="font-semibold text-lg mb-2 text-gray-900">
           Features :
          </h4>
          <ul className="text-gray-500 space-y-2 text-sm ">
           {plan.features.map((feature, idx) => (
            <li
             key={idx}
             className=" gap-3 font-bold text-gray-900 "
            >
             {feature.title}
             <span className="font-normal text-gray-700">
              {feature.des}
             </span>
            </li>
           ))}
          </ul>
         </div>

         <div className="mt-6 px-4">
          <h4 className="font-bold mb-2">Usage</h4>
          <ul className="text-gray-700 space-y-1 text-sm">
           {plan.usage.map((u, idx) => (
            <li key={idx} className="list-disc">
             {u}
            </li>
           ))}
          </ul>
         </div>
        </div>

        {/* Extra button below card */}
        <div className="w-full mt-15 ">
         <button
          onClick={() => setSelectedPlan(plan.name)}
          className={`w-full py-3 font-semibold rounded-lg ${
           selectedPlan === plan.name
            ? `${plan.buttonColor} text-white`
            : `bg-teal-300 text-white`
          }`}
         >
          {selectedPlan === plan.name ? "Selected" : "Select Plan"}
         </button>
        </div>
       </div>
      </div>
     ))}
    </div>
   </section>

   {/* :white_check_mark: FoodChow Marketing Experts Section */}
   <section className="bg-pink-50 border border-pink-500 mx-40 my-5 rounded-3xl p-10 mt-16">
    <h2 className="text-4xl font-extrabold text-center mb-2">
     Grow faster with FoodChow Marketing experts
    </h2>
    <p className="text-center font-semibold text-gray-700 mb-10">
     Setup, strategize & succeed – Get hands-on guidance to launch &
     level-up your business
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
     {/* Card 1 */}
     <div className="bg-white rounded-2xl p-6 shadow-md border border-pink-500">
      <h3 className="text-lg font-bold mb-4">Dedicated Onboarding</h3>
      <p className=" font-bold">
       Custom{" "}
       <span className="text-sm font-medium text-gray-500">
        one time fee
       </span>
      </p>
      <h4 className="mt-4 font-bold">Includes:</h4>
      <ul className="list-disc list-inside mt-2 text-gray-800 text-md space-y-3">
       <li>Dedicated number connection assistance</li>
       <li>Facebook Business verification</li>
       <li>BSP Migration</li>
       <li>
        1-hour of product walkthrough and chatbot training session
       </li>
       <li>
        Onboarding support is included with the annual plan for all
        recurring subscriptions.
       </li>
      </ul>
     </div>

     {/* Card 2 */}
     <div className="bg-white rounded-2xl p-6 shadow-md border border-pink-500">
      <h3 className="text-lg font-bold mb-4">
       Technical Account Management
      </h3>
      <p className="font-bold">
       Custom{" "}
       <span className="text-sm font-medium text-gray-500">
        annual fee
       </span>
      </p>
      <h4 className="mt-4 font-bold">Includes:</h4>
      <ul className="list-disc list-inside mt-2 text-gray-800 space-y-3">
       <li>
        Dedicated contact for technical guidance and support escalation
       </li>
       <li>
        Proactive monitoring to address potential issues before they
        impact your operations
       </li>
       <li>
        Hands-on assistance to troubleshoot custom configurations, APIs
        and integrations
       </li>
       <li>
        Premium escalation management (P1 tickets handled on priority,
        including direct phone support if required)
       </li>
       <li>
        This service can be availed by Business Annual plan customers
       </li>
      </ul>
     </div>

     {/* Card 3 */}
     <div className="bg-white rounded-2xl p-6 shadow-md border border-pink-500">
      <h3 className="text-lg font-bold mb-4">Professional Services</h3>
      <p className="font-bold">
       Custom{" "}
       <span className="text-sm font-medium text-gray-500">
        hourly fee
       </span>
      </p>
      <h4 className="mt-4 font-bold">Includes:</h4>
      <ul className="list-disc list-inside mt-2 text-gray-800 space-y-3">
       <li>
        30-min consultation with our expert to discuss your ideal
        workflow
       </li>
       <li>
        Setting up customized automations, CRM integrations & routing
        rules
       </li>
       <li>
        Creating tailored workflow for various scenarios including:
        <ul className=" ml-6">
         <li>CTWA lead acquisition</li>
         <li>Automating engagement, follow-ups</li>
         <li>Lead qualification, nurturing</li>
         <li>E-commerce order updates</li>
         <li>Deploying custom AI Agents</li>
        </ul>
       </li>
       <li>
        2 rounds of review to ensure Wati fits perfectly for you and
        your business
       </li>
       <li>
        This service can be availed by any recurring plan customers
       </li>
      </ul>
     </div>
    </div>

    {/* Button */}
    <div className="text-center mt-10">
     <button className="bg-blue-500 text-white px-8 py-3 rounded-full shadow-md hover:bg-blue-600 transition">
      Contact Us
     </button>
    </div>
   </section>

   {/* comparison table */}
   <section className="w-full flex flex-col items-center py-20 bg-white">
    {/* Header */}
    <div className="text-center max-w-3xl mb-10 mt-10">
     <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
      Comparison Table
     </h1>
     <p className="text-gray-500 mt-2">
      Up to <span className="font-bold">25% off</span> & free dedicated
      onboarding with annual subscription
     </p>
    </div>

    {/* compare pricing Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 max-w-7xl ">
     {/* compare feature list */}
     <div className="col-span-1 m-3 border border-gray-200 rounded-xl shadow-lg">
      <div className="space-y-10 text-center p-8">
       <h3 className="text-xl font-bold rounded-md w-full py-2 text-white bg-yellow-300 ">
        Features
       </h3>
       <p className="text-gray-500 text-md font-bold">Users Included</p>
       <ul className="space-y-10">
        {compareFeature.map((cf, i) => (
         <li key={i} className="text-gray-700 text-sm font-medium h-7">
          {cf}
         </li>
        ))}
       </ul>
      </div>
     </div>
     {/* 3 cards according plan */}
     <div className="grid grid-cols-1 md:grid-cols-3 items-stretch col-span-3">
      {plans.map((plan) => (
       <div
        key={plan.name}
        className="flex flex-col w-full h-full p-3 overflow-visible"
       >
        <div
         onClick={() => setSelectedPlan(plan.name)}
         className={`relative flex flex-col justify-between rounded-xl shadow-lg p-8 w-full h-full cursor-pointer ${
          plan.bgColor
         } border-1 ${
          selectedPlan === plan.name
           ? `${plan.borderColor} `
           : "border-transparent"
         }`}
        >
         <div className="space-y-10 text-center w-full">
          <h3
           className={`text-xl font-bold rounded-md w-full py-2 text-white ${plan.buttonColor}`}
          >
           {plan.name}
          </h3>

          <p className="text-gray-500 text-md font-bold">
           {plan.users}
          </p>
          {plan.compareValue.map((cv, i) => (
           <div
            key={i}
            className="text-center flex justify-center h-7"
           >
            {cv === true ? (
             <Check className="h-5 w-5 text-emerald-500 " />
            ) : cv === false ? (
             <X className="h-5 w-5 text-red-500" />
            ) : typeof cv === "string" ? (
             <span className="text-gray-600">{cv}</span>
            ) : (
             <span className="text-gray-400">—</span>
            )}
           </div>
          ))}
         </div>
         {/* Extra button below card */}
         {/* <div className="w-full mt-15 ">
         <button
          onClick={() => setSelectedPlan(plan.name)}
          className={`w-full py-3 font-semibold rounded-lg ${
           selectedPlan === plan.name
            ? `${plan.buttonColor} text-white`
            : `bg-teal-300 text-white`
          }`}
         >
          {selectedPlan === plan.name ? "Selected" : "Select Plan"}
         </button>
        </div> */}
        </div>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* FAQ */}
   <section className="w-full flex flex-col items-center py-10 bg-white">
    {/* Header */}
    <div className="text-center max-w-3xl mb-10 mt-10 border-b shadow-xl px-15 border-b-teal-300">
     <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-8">
      Frequently Asked Questions
     </h1>
    </div>

    {/* Q&A */}
    <div className="border border-teal-300 rounded-xl shadow max-w-7xl w-full p-8">
     {/* q1 */}
     <div className="px-10 py-6 mt-6 space-y-3 text-lg border-b border-b-teal-300 pb-12">
      <h1 className="flex items-center gap-3 font-bold text-gray-900">
       <BsQuestionCircle /> I use my existing WhatsApp number?
      </h1>
      <p className="text-gray-800">
       Yes, you can use an existing WhatsApp number. However, before
       onboarding, you must first delete the WhatsApp account linked to
       that number. Launch the WhatsApp app on your phone. Navigate to
       "Settings" within the app. Tap on "Account". Select "Delete my
       account". Enter your full phone number in the required field. Tap
       "Delete my account" to confirm the process.
      </p>
      <p className="text-gray-800">
       <span className="font-bold">Note: </span>WhatsApp chat backups{" "}
       <span className="font-bold">cannot</span> be imported into your
       Wati account.
      </p>
     </div>
     {/* q2 */}
     <div className="px-10 py-6 mt-6 space-y-3 text-lg border-b border-b-teal-300 pb-12">
      <h1 className="flex items-center gap-3 font-bold text-gray-900">
       <BsQuestionCircle /> Is there a setup fee for using the WhatsApp
       API?
      </h1>
      <p className="text-gray-800">
       There is no setup fee associated with using the WhatsApp API.
      </p>
     </div>
     {/* q3 */}
     <div className="px-10 py-6 mt-6 space-y-3 text-lg border-b border-b-teal-300 pb-12">
      <h1 className="flex items-center gap-3 font-bold text-gray-900">
       <BsQuestionCircle /> What does WhatsApp message-based pricing mean if WhatsApp is free?
      </h1>
      <p className="text-gray-800">
       While regular WhatsApp usage is free, businesses using WhatsApp Business API to grow their business will incur charges for sending customer messages. WhatsApp message based pricing depends on your recipient customer's country code and your message template. <span className="text-blue-400">Please check our article on Meta's pricing for more details.</span>
      </p>
      
     </div>
      {/* q4 */}
     <div className="px-10 py-6 mt-6 space-y-3 text-lg border-b border-b-teal-300 pb-12">
      <h1 className="flex items-center gap-3 font-bold text-gray-900">
       <BsQuestionCircle /> What is an automation trigger? How can I obtain more triggers than my plan allows?
      </h1>
      <p className="text-gray-800">
       Every time automation (whether it's a chatbot or a keyword or any other rule) you have set up in Wati is invoked for your customer, that counts as a chatbot session. Every plan comes with a certain number of automation triggers, beyond which you will have to respond to your customers manually. You can easily buy additional automation triggers from the product's ‘Your Plan’ page. Automation triggers can be bought every month, even if you are on an annual plan to accommodate seasonal traffic.
      </p>
      
     </div>
      {/* q5 */}
     <div className="px-10 py-6 mt-6 space-y-3 text-lg border-b border-b-teal-300 pb-12">
      <h1 className="flex items-center gap-3 font-bold text-gray-900">
       <BsQuestionCircle /> How can I upgrade or downgrade my plan?
      </h1>
      <p className="text-gray-800">
       You can upgrade your plan or move from a monthly plan to an annual one anytime from the 'Switch Plan' section of your Account Details. Your charges will be prorated based on the date of the change. Any downgrades will be effective only at the end of your current billing cycle. If you cannot change your plan or need our help determining which plan is right for you, please contact us at <span className="text-blue-400" >billing@wati.io</span>
      </p>
      
     </div>
    </div>
   </section>
  </>
 );
};

export default PricingPlans;