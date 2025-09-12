import React from 'react';
import brodcastIcon from '../../assets/Total_brodcast.png';
import liveIcon from '../../assets/Live_brodcast.png';
import sentIcon from '../../assets/sent_brodcast.png';
import totalIcon from '../../assets/S.png';

const BroadcastStats = ({ data, totalRecords }) => {
  if (!data || !Array.isArray(data)) {
    return <p>Invalid data</p>;
  }

  const filteredData = data.filter(
    (item) => item.status !== "Stopped" && item.status !== "Paused"
  );

  const totalStats = filteredData.reduce(
    (acc, item) => ({
      totalContacts: acc.totalContacts + (item.sent || 0),
      delivered: acc.delivered + (item.delivered || 0),
      read: acc.read + (item.read || 0),
      clicks: acc.clicks + (item.clicked || 0),
    }),
    { totalContacts: 0, delivered: 0, read: 0, clicks: 0 }
  );

  const stats = [
    { label: "Total Broadcasts", value: totalRecords, icon: brodcastIcon },
    { label: "Message Delivered", value: totalStats.delivered, icon: liveIcon },
    { label: "Message Read", value: totalStats.read, icon: sentIcon },
    { label: "Total Link Click", value: totalStats.clicks, icon: totalIcon },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-white/95 p-5 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-4">
            <img src={item.icon} alt={item.label} className="w-14 h-14" />
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-800">
                {item.value.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BroadcastStats;
