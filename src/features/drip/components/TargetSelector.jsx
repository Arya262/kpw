import { Users, UserCheck, Tag } from "lucide-react";

const TargetSelector = ({ targetType, targetIds, groups, onChange }) => {
  const targetOptions = [
    {
      value: "all_contacts",
      label: "All Contacts",
      description: "Send to all your contacts",
      icon: Users,
    },
    {
      value: "group",
      label: "Specific Groups",
      description: "Target contacts in selected groups",
      icon: UserCheck,
    },
    {
      value: "tag",
      label: "By Tags",
      description: "Target contacts with specific tags",
      icon: Tag,
    },
  ];

  const handleTargetTypeChange = (value) => {
    onChange(value, []);
  };

  const handleGroupSelection = (groupId) => {
    const isSelected = targetIds.includes(groupId);
    const newTargetIds = isSelected
      ? targetIds.filter((id) => id !== groupId)
      : [...targetIds, groupId];
    onChange(targetType, newTargetIds);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Target Audience
      </h3>

      <div className="space-y-3">
        {targetOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div key={option.value}>
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="target_type"
                  value={option.value}
                  checked={targetType === option.value}
                  onChange={(e) => handleTargetTypeChange(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {option.description}
                  </p>
                </div>
              </label>

              {/* Group Selection */}
              {option.value === "group" && targetType === "group" && (
                <div className="ml-9 mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {groups.length === 0 ? (
                    <p className="text-sm text-gray-500">No groups available</p>
                  ) : (
                    groups.map((group) => (
                      <label
                        key={group.group_id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={targetIds.includes(group.group_id)}
                          onChange={() => handleGroupSelection(group.group_id)}
                        />
                        <span className="text-sm text-gray-700">
                          {group.group_name} ({group.total_contacts || 0} contacts)
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TargetSelector;
