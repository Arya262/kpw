import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

const ClockTimePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("hour");
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [period, setPeriod] = useState("AM");
  const clockRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(":").map(Number);
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      setSelectedHour(hour12);
      setSelectedMinute(minutes);
      setPeriod(hours >= 12 ? "PM" : "AM");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const formatTime = () => {
    if (!value) return "";
    const [hours, minutes] = value.split(":").map(Number);
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${hour12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const handleOk = () => {
    let hours24 = selectedHour;
    if (period === "AM" && selectedHour === 12) hours24 = 0;
    else if (period === "PM" && selectedHour !== 12) hours24 = selectedHour + 12;
    onChange(`${hours24.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`);
    setIsOpen(false);
  };

  const getHandRotation = () => (mode === "hour" ? (selectedHour % 12) * 30 : selectedMinute * 6);

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-left bg-white hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
      >
        <Clock className="w-4 h-4 text-gray-400" />
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {formatTime() || label || "Select time"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden w-80 animate-in fade-in zoom-in-95 duration-200">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 p-5 text-white">
              <p className="text-xs uppercase tracking-wider opacity-80 mb-2">Select Time</p>
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setMode("hour")}
                  className={`text-5xl font-light transition-all ${mode === "hour" ? "opacity-100 scale-105" : "opacity-50 hover:opacity-70"}`}
                >
                  {selectedHour.toString().padStart(2, "0")}
                </button>
                <span className="text-5xl font-light">:</span>
                <button
                  type="button"
                  onClick={() => setMode("minute")}
                  className={`text-5xl font-light transition-all ${mode === "minute" ? "opacity-100 scale-105" : "opacity-50 hover:opacity-70"}`}
                >
                  {selectedMinute.toString().padStart(2, "0")}
                </button>
                <div className="flex flex-col ml-3 text-sm gap-1">
                  <button
                    type="button"
                    onClick={() => setPeriod("AM")}
                    className={`px-2 py-0.5 rounded transition-all ${period === "AM" ? "bg-white/20 font-semibold" : "opacity-50 hover:opacity-70"}`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("PM")}
                    className={`px-2 py-0.5 rounded transition-all ${period === "PM" ? "bg-white/20 font-semibold" : "opacity-50 hover:opacity-70"}`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Clock Face */}
            <div className="p-6 bg-gray-50">
              <div
                ref={clockRef}
                className="relative w-56 h-56 mx-auto bg-white rounded-full shadow-inner cursor-pointer border border-gray-100"
              >
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-teal-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-sm" />
                
                {/* Clock hand */}
                <div
                  className="absolute top-1/2 left-1/2 origin-[center_bottom] transition-transform duration-200 z-10"
                  style={{
                    transform: `translateX(-50%) rotate(${getHandRotation()}deg)`,
                    height: mode === "hour" ? "55px" : "70px",
                    width: "2px",
                    marginTop: mode === "hour" ? "-55px" : "-70px",
                    background: "linear-gradient(to top, #0AA89E, #06b6d4)",
                  }}
                />

                {/* Numbers */}
                {(mode === "hour" ? hours : minutes).map((num, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const radius = 85;
                  const x = Math.cos(angle) * radius + 112;
                  const y = Math.sin(angle) * radius + 112;
                  const isSelected = mode === "hour" ? selectedHour === num : selectedMinute === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (mode === "hour") {
                          setSelectedHour(num);
                          setTimeout(() => setMode("minute"), 200);
                        } else {
                          setSelectedMinute(num);
                        }
                      }}
                      className={`absolute w-9 h-9 flex items-center justify-center text-sm font-medium rounded-full transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white shadow-md scale-110"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      style={{ left: `${x - 18}px`, top: `${y - 18}px` }}
                    >
                      {mode === "hour" ? num : num.toString().padStart(2, "0")}
                    </button>
                  );
                })}
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

export default ClockTimePicker;
