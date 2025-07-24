import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const BroadcastTable = ({
  filteredData,
  selectAll,
  handleSelectAllChange,
  selectedRows,
  handleCheckboxChange,
  menuOpen,
  toggleMenu,
  handleDelete,
  loading,
  error,
  onDelete,
  onEdit,
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [shouldFlipUp, setShouldFlipUp] = useState(false);
  const dropdownRef = useRef(null);
  const rowRefs = useRef({});
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [highlightCancel, setHighlightCancel] = useState(false);

  const toggleDropdown = (idx) => {
    setDropdownOpen((prev) => {
      const next = !prev;
      if (next && rowRefs.current[idx]) {
        const rect = rowRefs.current[idx].getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setShouldFlipUp(spaceBelow < 160);
      }
      return next;
    });
    toggleMenu(idx);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        toggleMenu(null);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, toggleMenu]);

  const handleDeleteClick = (broadcast) => {
    setSelectedBroadcast(broadcast);
    setShowDeleteDialog(true);
    menuOpen(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBroadcast) return;

    try {
      setIsDeleting(true);
      await onDelete(selectedBroadcast.id);
      setShowDeleteDialog(false);
      setSelectedBroadcast(null);
    } catch (error) {
      console.error("Error deleting broadcast:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setSelectedBroadcast(null);
  };

  const handleEditClick = (broadcast) => {
    menuOpen(null);
    if (onEdit) {
      onEdit(broadcast);
    }
  };

  const parsedData = useMemo(() => {
    return filteredData.map((row) => {
      let parsedMeta = undefined;
      if (row.container_meta) {
        if (typeof row.container_meta === "string") {
          try {
            parsedMeta = JSON.parse(row.container_meta);
          } catch (err) {
            console.error(
              "Invalid JSON in container_meta:",
              row.container_meta
            );
          }
        } else if (typeof row.container_meta === "object") {
          parsedMeta = row.container_meta;
        }
      }
      return { ...row, container_meta: parsedMeta };
    });
  }, [filteredData]);

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
      return (
        <tr>
          <td colSpan="6" className="text-center py-4 text-red-500">
            Error: {error}
          </td>
        </tr>
      );
    }

    if (parsedData.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-4 text-gray-500">
            No broadcasts available.
          </td>
        </tr>
      );
    }

    return parsedData
      .filter((row) => row.status !== "Stopped" && row.status !== "Paused")
      .map((row, idx) => (
        <tr
          key={idx}
          ref={(el) => (rowRefs.current[idx] = el)}
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
                <span>{`${row.container_meta.sampleText.slice(
                  0,
                  40
                )}...`}</span>
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
            {row.schedule.toLowerCase() === "yes"
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
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">
                  Broadcast Name
                </th>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">
                  Message Type
                </th>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">
                  Scheduled Broadcast
                </th>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-2 py-3 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">
                  Message Funnel
                </th>
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>
      </div>

      {/* ✅ Modal for Viewing Full Message */}
      {showMessageModal && (
        <MessageModal
          message={currentMessage}
          onClose={() => setShowMessageModal(false)}
          highlightCancel={highlightCancel}
        />
      )}
    </>
  );
};

// ✅ Message Modal Component (inline)
const MessageModal = ({ message, onClose, highlightCancel }) => {
  const modalRef = useRef();

  // ESC key support
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Click outside to close
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#000]/40"
      onMouseDown={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className={`absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors cursor-pointer ${
            highlightCancel
              ? "bg-red-500 text-white hover:text-white"
              : "bg-gray-100"
          }`}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Message</h2>
        <div className="text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto text-[15px] leading-relaxed scrollbar-hide">
          {message}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-[#0AA89E] text-white font-medium rounded hover:bg-[#08847C] transition-colors duration-200 cursor-pointer"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  if (hasTime) {
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return (
      <div className="flex flex-col">
        <span>{formattedDate}</span>
        <span>{formattedTime}</span>
      </div>
    );
  }
  return <span>{formattedDate}</span>;
};

const renderMessageFunnel = (row) => {
  if (!row) return "N/A";

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
