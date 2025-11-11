import { Users, CheckCircle, Clock, Target } from "lucide-react";

const DripCampaignStats = ({ data = [], totalRecords = 0 }) => {
  const stats = {
    total: totalRecords,
    active: data.filter((c) => c.status === "active").length,
    enrolled: data.reduce((sum, c) => sum + (c.total_enrolled || 0), 0),
    completed: data.reduce((sum, c) => sum + (c.total_completed || 0), 0),
  };

  const statCards = [
    {
      label: "Total Campaigns",
      value: stats.total,
      icon: Target,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Active Campaigns",
      value: stats.active,
      icon: Clock,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Enrolled",
      value: stats.enrolled,
      icon: Users,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "bg-teal-500",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DripCampaignStats;
