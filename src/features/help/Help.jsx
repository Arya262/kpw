import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";

const tutorials = [
  {
    title: "Add a WhatsApp Number",
    subtitle: "Foodchow",
    // image: "",
    highlight: "WhatsApp",
  },
  {
    title: "How to Access",
    subtitle: "Foodchow",
    // image: "",
  },
  {
    title: "Manage WhatsApp",
    subtitle: "Foodchow",
    // image: "",
    highlight: "WhatsApp",
  },
  {
    title: "How to Add",
    subtitle: "Foodchow",
    // image: "",
  },
];

export default function Help() {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
  }, [showModal]);

  const handleSend = () => {
    if (message.trim()) {
      console.log("Message sent:", message);
      setShowModal(false);
      setMessage("");
    } else {
      alert("Please enter a message.");
    }
  };

  return (
    <div className="bg-[#F1F8FF] py-12 px-4 md:px-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Help & Tutorials
        </h1>
        <p className="text-gray-600 text-base">
          Tell us about your problem, and we’ll find you a solution.
        </p>
      </div>

      {/* Help Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="md:w-2/3">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Have Questions?
          </h2>
          <ul className="text-gray-700 space-y-2 text-sm leading-relaxed list-disc pl-5">
            <li>
              Have suggestions for new features or encountered a bug? Share your
              feedback and track its progress on our{" "}
              <a href="/onboarding-guide" className="text-blue-600 underline">
                Roadmap.
              </a>
            </li>
            <li>
              No matter how skilled you might be, sometimes we all need a little
              support.
            </li>
            <li>
              We are here to help you succeed with building your workflows.
            </li>
            <li>
              Get assistance on troubleshooting errors, and learn about new
              automation too.
            </li>
            <li>We will try our best to help you with every issue.</li>
            <li>
              Want to manage or cancel a subscription? Visit the My
              Subscriptions section.
            </li>
          </ul>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 px-5 py-2.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
          >
            Ask a Question
          </button>
        </div>

        <div className="md:w-1/3 flex justify-center">
          <div className="bg-indigo-100 p-6 rounded-full">
            <Bot className="text-indigo-600 w-24 h-24" />
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1.05 }}
              exit={{ scale: 0.7 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>

              <h2 className="text-xl font-semibold mb-4">💬 Contact Support</h2>
              <p className="text-gray-600 mb-6">
                Tell us what’s going wrong or how we can help you:
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 border rounded mb-4 resize-none h-28"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Send
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorials Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tutorials</h2>
          <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
            View All Videos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tutorials.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow p-4 hover:shadow-md transition"
            >
              <img
                src={item.image}
                alt={item.title}
                className="rounded-lg mb-3"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {item.highlight && item.title.includes(item.highlight) ? (
                  <>
                    {item.title.split(item.highlight)[0]}
                    <span className="text-red-500">{item.highlight}</span>
                    {item.title.split(item.highlight)[1]}
                  </>
                ) : (
                  item.title
                )}
              </h3>
              <p className="text-xs text-gray-500">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
