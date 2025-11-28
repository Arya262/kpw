import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const DatePicker = ({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  autoClose = true, // NEW — auto close after selecting date
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const modalRef = useRef(null);

  /** Safe YYYY-MM-DD parsing */
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split("-").map(Number);
      if (year && month && day) {
        const d = new Date(year, month - 1, day);
        setSelectedDate(d);
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [value]);

  /** Close when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const formatDate = () => {
    if (!selectedDate) return "";
    return selectedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const handleDateSelect = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    setSelectedDate(d);

    if (autoClose) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      onChange(`${y}-${m}-${dd}`);
      setIsOpen(false);
    }
  };

  const isDateDisabled = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    if (minDate && d < new Date(minDate + "T00:00:00")) return true;
    if (maxDate && d > new Date(maxDate + "T00:00:00")) return true;
    return false;
  };

  const isToday = (day) => {
    const t = new Date();
    return (
      day === t.getDate() &&
      currentMonth === t.getMonth() &&
      currentYear === t.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const handleOk = () => {
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${y}-${m}-${d}`);
    }
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-left bg-white hover:bg-gray-50 transition-all flex items-center gap-2"
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className={selectedDate ? "text-gray-900" : "text-gray-400"}>
          {formatDate() || label || "Select date"}
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm animate-in fade-in zoom-in-95"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 px-5 py-4 text-white flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                type="button"
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-semibold">
                {MONTHS[currentMonth]}, {currentYear}
              </h3>

              <button
                onClick={handleNextMonth}
                type="button"
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar grid */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="h-8 flex items-center justify-center text-xs text-gray-500"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => (
                  <div key={idx} className="flex justify-center">
                    {day && (
                      <button
                        onClick={() =>
                          !isDateDisabled(day) && handleDateSelect(day)
                        }
                        disabled={isDateDisabled(day)}
                        className={`w-9 h-9 flex items-center justify-center text-sm rounded-full
                          ${
                            isSelected(day)
                              ? "bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white"
                              : isToday(day)
                              ? "border-2 border-teal-500 text-teal-600"
                              : isDateDisabled(day)
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {day}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer only shows if NOT auto-close */}
            {!autoClose && (
              <div className="flex justify-end gap-3 px-5 py-4 bg-white border-t">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOk}
                  className="px-5 py-2 bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white rounded-xl"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
