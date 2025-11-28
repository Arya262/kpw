import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MonthPicker = ({ value, onChange, label, maxMonth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const modalRef = useRef(null);

  // Parse initial value (format: "YYYY-MM")
  useEffect(() => {
    if (value) {
      const [year, month] = value.split("-").map(Number);
      if (year && month) {
        setSelectedYear(year);
        setSelectedMonth(month - 1);
        setCurrentYear(year);
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const formatDisplay = () => {
    if (selectedMonth === null || selectedYear === null) return "";
    return `${MONTHS[selectedMonth]} ${selectedYear}`;
  };

  const handlePrevYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);

  const handleMonthSelect = (monthIndex) => {
    if (isMonthDisabled(monthIndex)) return;
    setSelectedMonth(monthIndex);
    setSelectedYear(currentYear);
  };

  const handleOk = () => {
    if (selectedMonth !== null && selectedYear !== null) {
      const monthStr = String(selectedMonth + 1).padStart(2, "0");
      onChange(`${selectedYear}-${monthStr}`);
    }
    setIsOpen(false);
  };

  const isMonthDisabled = (monthIndex) => {
    if (!maxMonth) return false;
    const [maxYear, maxMon] = maxMonth.split("-").map(Number);
    if (currentYear > maxYear) return true;
    if (currentYear === maxYear && monthIndex + 1 > maxMon) return true;
    return false;
  };

  const isSelected = (monthIndex) => {
    return selectedMonth === monthIndex && selectedYear === currentYear;
  };

  const isCurrent = (monthIndex) => {
    const now = new Date();
    return monthIndex === now.getMonth() && currentYear === now.getFullYear();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-left bg-white hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className={selectedMonth !== null ? "text-gray-900" : "text-gray-400"}>
          {formatDisplay() || label || "Select month"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-80 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 px-5 py-4 text-white flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevYear}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-semibold">{currentYear}</h3>

              <button
                type="button"
                onClick={handleNextYear}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Month Grid */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    disabled={isMonthDisabled(index)}
                    className={`py-3 px-2 text-sm font-medium rounded-xl transition-all ${
                      isSelected(index)
                        ? "bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white shadow-md"
                        : isCurrent(index)
                        ? "border-2 border-teal-500 text-teal-600"
                        : isMonthDisabled(index)
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 px-5 py-4 bg-white border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOk}
                className="px-5 py-2 bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthPicker;
