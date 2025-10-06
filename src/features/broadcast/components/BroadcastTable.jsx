import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { formatDate } from "../../../utils/formatters";

const BroadcastTable = ({ filteredData, loading, error }) => {
  const navigate = useNavigate();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  
  // Log the raw filteredData when it changes
  useEffect(() => {
    console.log('Raw filteredData:', filteredData);
  }, [filteredData]);

  // Parse container_meta safely
  const parsedData = useMemo(() => {
    return filteredData.map((row) => {
      let parsedMeta = {};
      if (row.container_meta) {
        if (typeof row.container_meta === "string") {
          try {
            parsedMeta = JSON.parse(row.container_meta);
          } catch (err) {
            console.error("Invalid JSON in container_meta:", row.container_meta);
          }
        } else if (typeof row.container_meta === "object") {
          parsedMeta = row.container_meta;
        }
      }
      return { ...row, container_meta: parsedMeta };
    });
  }, [filteredData]);

  // Filter active broadcasts
  const activeBroadcasts = useMemo(
    () => parsedData.filter((row) => row.status !== "Stopped" && row.status !== "Paused"),
    [parsedData]
  );

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0AA89E]"></div>
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      console.error("Error loading broadcasts:", error);
    }

    if (activeBroadcasts.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-4 text-gray-500">
            No broadcasts available.
          </td>
        </tr>
      );
    }

    return activeBroadcasts.map((row, idx) => (
      <tr
        key={idx}
        className="border-t border-b border-b-[#C3C3C3] hover:bg-gray-50 text-md"
      >
        <td className="px-2 py-4 sm:px-4 sm:py-4 whitespace-nowrap text-[12px] sm:text-[16px] text-gray-700">
          {formatDate(row.created_at)}
        </td>
        <td className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700">
          {row.broadcast_name}
        </td>
        <td className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700">
          {row.container_meta?.sampleText ? (
            <div className="flex flex-col items-start">
              <span>{`${row.container_meta.sampleText.slice(0, 40)}...`}</span>
              <div className="w-full flex justify-center mt-1">
                <button
                  onClick={() => {
                    setCurrentMessage(row.container_meta.sampleText);
                    setShowMessageModal(true);
                  }}
                  className="text-[#0AA89E] text-xs flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  View Message
                </button>
              </div>
            </div>
          ) : (
            row.message_type
          )}
        </td>
        <td className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700">
          {row.schedule?.toLowerCase() === "yes"
            ? formatDate(row.schedule_date)
            : "No"}
        </td>
        <td className="px-2 py-4 text-[12px] sm:text-[16px] text-green-600">
          {row.status}
        </td>
        <td className="px-2 py-4 text-[12px] justify-end sm:text-[16px] w-auto font-semibold text-gray-700">
          {renderMessageFunnel(row)}
        </td>
      </tr>
    ));
  };

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[900px] bg-white shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
          <table className="w-full text-sm text-center table-auto">
            <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
              <tr>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">Date</th>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">Campaign Name</th>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">Message</th>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">Scheduled Campaign</th>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">Status</th>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">Message Funnel</th>
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>
      </div>

      {showMessageModal && (
        <MessageModal
          message={currentMessage}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </>
  );
};

const MessageModal = ({ message, onClose }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md relative transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-200"
          aria-label="Close"
        >
          <span className="text-2xl font-bold cursor-pointer">×</span>
        </button>
        <h2 id="message-modal-title" className="text-xl font-semibold text-gray-800 mb-4">Message</h2>
        <div className="text-gray-700 text-sm sm:text-base whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed pr-1 custom-scroll">
          {message}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-[#0AA89E] text-white font-medium rounded-lg hover:bg-[#08847C] transition duration-200"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

const renderMessageFunnel = (row = {}) => {
  const { sent = 0, delivered = 0, read = 0, clicked = 0 } = row;
  return (
    <div className="grid grid-cols-4 gap-4 justify-items-center">
      <div className="flex flex-col items-center text-center">
        <span className="text-lg font-bold">{sent}</span>
        <span className="text-sm text-gray-500">Total contacts</span>
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-lg font-bold">{delivered}</span>
        <span className="text-sm text-gray-500">Delivered</span>
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-lg font-bold">{read}</span>
        <span className="text-sm text-gray-500">Read</span>
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-lg font-bold">{clicked}</span>
        <span className="text-sm text-gray-500">Clicks</span>
      </div>
    </div>
  );
};

export default BroadcastTable;
