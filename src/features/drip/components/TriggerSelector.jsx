import { Hand, UserPlus, Calendar, Webhook } from "lucide-react";

const TriggerSelector = ({ value, onChange }) => {
  const triggers = [
    {
      value: "manual",
      label: "Manual Start",
      description: "You manually enroll contacts",
      icon: Hand,
    },
    {
      value: "contact_added",
      label: "Contact Added",
      description: "Trigger when a contact is added to a group",
      icon: UserPlus,
      badge: "Coming Soon",
    },
    {
      value: "scheduled",
      label: "Scheduled",
      description: "Start at a specific date and time",
      icon: Calendar,
      badge: "Coming Soon",
    },
    {
      value: "webhook",
      label: "Webhook",
      description: "Trigger via API webhook",
      icon: Webhook,
      badge: "Coming Soon",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Campaign Trigger
      </h3>

      <div className="space-y-3">
        {triggers.map((trigger) => {
          const Icon = trigger.icon;
          const isDisabled = trigger.badge === "Coming Soon";

          return (
            <label
              key={trigger.value}
              className={`flex items-start gap-3 p-3 border border-gray-200 rounded-lg transition-colors ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="trigger_type"
                value={trigger.value}
                checked={value === trigger.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={isDisabled}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    {trigger.label}
                  </span>
                  {trigger.badge && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {trigger.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {trigger.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default TriggerSelector;
