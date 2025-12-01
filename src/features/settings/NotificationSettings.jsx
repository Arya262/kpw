import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Moon,
  Eye,
  EyeOff,
  Clock,
  MessageCircle,
  AlertTriangle,
  CalendarCheck,
  Info,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { toast } from "react-toastify";

const NotificationSettings = () => {
  const {
    preferences,
    toggleNotifications,
    toggleSound,
    setVolume,
    togglePrivacyMode,
    setDoNotDisturb,
    snoozeNotifications,
    cancelSnooze,
    setCategoryEnabled,
    isDoNotDisturb,
    snoozeRemaining,
  } = useNotifications();

  const [localSnoozeRemaining, setLocalSnoozeRemaining] = useState(snoozeRemaining);

  // Update snooze remaining every minute
  useEffect(() => {
    setLocalSnoozeRemaining(snoozeRemaining);
    const interval = setInterval(() => {
      setLocalSnoozeRemaining((prev) => Math.max(0, prev - 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [snoozeRemaining]);

  const formatSnoozeRemaining = (ms) => {
    const mins = Math.ceil(ms / 60000);
    if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""}`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0
      ? `${hours}h ${remainingMins}m`
      : `${hours} hour${hours !== 1 ? "s" : ""}`;
  };

  const handleToggleNotifications = async () => {
    const result = await toggleNotifications();
    if (result) {
      toast.success("Notifications enabled");
    } else {
      toast.info("Notifications disabled");
    }
  };

  const handleSnooze = (minutes) => {
    snoozeNotifications(minutes);
    toast.info(`Notifications snoozed for ${minutes < 60 ? `${minutes} minutes` : `${minutes / 60} hour${minutes > 60 ? "s" : ""}`}`);
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ enabled, onToggle, disabled = false }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        enabled ? "bg-teal-500" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="pt-2.5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Notification Settings</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] p-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">How notifications work:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>In-app toast appears when you receive a new message</li>
              <li>Browser notification shows when app is in background</li>
              <li>Sound plays with each new message (if enabled)</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Notifications Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${preferences.enabled ? "bg-teal-100" : "bg-gray-200"}`}>
                {preferences.enabled ? (
                  <Bell className="w-6 h-6 text-teal-600" />
                ) : (
                  <BellOff className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <p className="text-sm text-gray-500">
                  Show toast & browser alerts for new messages
                </p>
              </div>
            </div>
            <ToggleSwitch enabled={preferences.enabled} onToggle={handleToggleNotifications} />
          </div>

          {/* Sound Settings */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${preferences.soundEnabled ? "bg-teal-100" : "bg-gray-200"}`}>
                  {preferences.soundEnabled ? (
                    <Volume2 className="w-6 h-6 text-teal-600" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Sound</h3>
                  <p className="text-sm text-gray-500">Play sound when new message arrives</p>
                </div>
              </div>
              <ToggleSwitch enabled={preferences.soundEnabled} onToggle={toggleSound} />
            </div>

            {preferences.soundEnabled && (
              <div className="ml-16 mt-4">
                <label className="text-sm text-gray-600 mb-2 block">Volume</label>
                <div className="flex items-center gap-4">
                  <VolumeX className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.soundVolume * 100}
                    onChange={(e) => setVolume(e.target.value / 100)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {Math.round(preferences.soundVolume * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${preferences.privacyMode ? "bg-teal-100" : "bg-gray-200"}`}>
                {preferences.privacyMode ? (
                  <EyeOff className="w-6 h-6 text-teal-600" />
                ) : (
                  <Eye className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Privacy Mode</h3>
                <p className="text-sm text-gray-500">
                  Hide message content in notifications (shows "New message" only)
                </p>
              </div>
            </div>
            <ToggleSwitch enabled={preferences.privacyMode} onToggle={togglePrivacyMode} />
          </div>

          {/* Do Not Disturb */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${preferences.doNotDisturb.enabled ? "bg-orange-100" : "bg-gray-200"}`}>
                  <Moon className={`w-6 h-6 ${preferences.doNotDisturb.enabled ? "text-orange-600" : "text-gray-500"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Do Not Disturb</h3>
                  <p className="text-sm text-gray-500">Mute all alerts during scheduled hours</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={preferences.doNotDisturb.enabled}
                onToggle={() => setDoNotDisturb(!preferences.doNotDisturb.enabled)}
              />
            </div>

            {preferences.doNotDisturb.enabled && (
              <div className="ml-16 mt-4 flex items-center gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Start Time</label>
                  <input
                    type="time"
                    value={preferences.doNotDisturb.startTime}
                    onChange={(e) =>
                      setDoNotDisturb(true, e.target.value, preferences.doNotDisturb.endTime)
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <span className="text-gray-500 mt-6">to</span>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">End Time</label>
                  <input
                    type="time"
                    value={preferences.doNotDisturb.endTime}
                    onChange={(e) =>
                      setDoNotDisturb(true, preferences.doNotDisturb.startTime, e.target.value)
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            {isDoNotDisturb && (
              <div className="ml-16 mt-3 text-sm text-orange-600 flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Do Not Disturb is currently active
              </div>
            )}
          </div>

          {/* Snooze */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full ${localSnoozeRemaining > 0 ? "bg-orange-100" : "bg-gray-200"}`}>
                <Clock className={`w-6 h-6 ${localSnoozeRemaining > 0 ? "text-orange-600" : "text-gray-500"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Snooze Notifications</h3>
                <p className="text-sm text-gray-500">Temporarily mute all notifications</p>
              </div>
            </div>

            {localSnoozeRemaining > 0 ? (
              <div className="ml-16">
                <div className="flex items-center gap-4">
                  <span className="text-orange-600 font-medium">
                    Snoozed for {formatSnoozeRemaining(localSnoozeRemaining)}
                  </span>
                  <button
                    onClick={() => {
                      cancelSnooze();
                      setLocalSnoozeRemaining(0);
                      toast.success("Snooze cancelled");
                    }}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Cancel Snooze
                  </button>
                </div>
              </div>
            ) : (
              <div className="ml-16 flex flex-wrap gap-2">
                {[
                  { mins: 15, label: "15 min" },
                  { mins: 30, label: "30 min" },
                  { mins: 60, label: "1 hour" },
                  { mins: 120, label: "2 hours" },
                  { mins: 240, label: "4 hours" },
                  { mins: 480, label: "8 hours" },
                ].map(({ mins, label }) => (
                  <button
                    key={mins}
                    onClick={() => handleSnooze(mins)}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 hover:border-teal-500 hover:text-teal-600 rounded-lg transition"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Categories */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4">Notification Categories</h3>
            <p className="text-sm text-gray-500 mb-4">Choose which types of notifications you want to receive</p>

            <div className="space-y-3">
              {[
                { key: "message", label: "Messages", icon: MessageCircle, description: "New chat messages" },
                { key: "alert", label: "Alerts", icon: AlertTriangle, description: "Important system alerts" },
                { key: "event", label: "Events", icon: CalendarCheck, description: "Scheduled events and reminders" },
              ].map(({ key, label, icon: Icon, description }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">{label}</span>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={preferences.categories?.[key] !== false}
                    onToggle={() => setCategoryEnabled(key, !preferences.categories?.[key])}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
