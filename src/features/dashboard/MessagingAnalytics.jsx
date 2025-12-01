import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { getPermissions } from "../../utils/getPermissions";
import Loader from "../../components/Loader";
import { API_ENDPOINTS } from "../../config/api";
import { CalendarClock, Megaphone, Radio, Send } from "lucide-react";
import axios from "axios";
import ContactPart from "./ContactPart";
import DatePicker from "../../components/DatePicker";
import MonthPicker from "../../components/MonthPicker";

// Utility: Get date range for filter
function getDateRange(filter, options) {
  switch (filter) {
    case "Monthly":
      const [year, month] = options.month.split("-").map(Number);
      return [
        new Date(year, month - 1, 1),
        endOfMonth(new Date(year, month - 1, 1)),
      ];
    case "Weekly":
      return [
        startOfWeek(new Date(options.week), { weekStartsOn: 1 }),
        endOfWeek(new Date(options.week), { weekStartsOn: 1 }),
      ];
    case "Yearly":
      return [
        new Date(`${options.year}-01-01`),
        new Date(`${options.year}-12-31`),
      ];
    case "Custom":
      return [parseISO(options.start), parseISO(options.end)];
    default:
      return [null, null];
  }
}

const MESSAGE_COLORS = ["#00C49F", "#FFBB28"];
const COST_COLORS = ["#8884d8", "#82ca9d"];
const FILTER_OPTIONS = ["Weekly", "Monthly", "Yearly", "Custom"];

export default function MessagingAnalytics({ usageHistory }) {
  const { user } = useAuth();
  const permissions = useMemo(() => {
    return user ? getPermissions(user) : {};
  }, [user]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Monthly");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeekStart, setSelectedWeekStart] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [broadcasts, setBroadcasts] = useState([]);

  // Define today's date & month for max attributes
  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const todayMonth = todayDate.slice(0, 7);

  useEffect(() => {
    if (usageHistory && usageHistory.length > 0) {
      const formatted = usageHistory.map((item) => ({
        customer_id: item.customer_id,
        usage_date: new Date(item.usage_date).toISOString().split("T")[0],
        parsed_date: new Date(item.usage_date), // Store parsed date for performance
        messages_sent: parseInt(item.messages_sent || 0),
        messages_received: parseInt(item.messages_received || 0),
        gupshup_fees: parseFloat(item.gupshup_fees || 0),
        meta_fees: parseFloat(item.meta_fees || 0),
        total_cost: parseFloat(item.total_cost || 0),
      }));
      setData(formatted);
    } else {
      setData([]);
    }
    setLoading(false);
  }, [usageHistory]);

  // Set dynamic defaults after data is loaded
  useEffect(() => {
    const dateObj =
      data.length > 0 ? new Date(data[data.length - 1].usage_date) : new Date();
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    setSelectedMonth(`${yyyy}-${mm}`);
    setSelectedWeekStart(`${yyyy}-${mm}-${dd}`);
    setSelectedYear(`${yyyy}`);
    setCustomStart(`${yyyy}-${mm}-01`);
    setCustomEnd(`${yyyy}-${mm}-${dd}`);
  }, [data]);

  // Fetch broadcasts
  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.BROADCASTS.GET_ALL}?customer_id=${user?.customer_id}`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch broadcasts");
        }
        const data = await response.json();
        setBroadcasts(Array.isArray(data.broadcasts) ? data.broadcasts : []);
      } catch (err) { }
    };
    fetchBroadcasts();
  }, [user]);

  const YEAR_OPTIONS = useMemo(() => {
    const currentYear = new Date().getFullYear();
    // Show last 5 years plus any years from data
    const dataYears = data.map((d) => new Date(d.usage_date).getFullYear());
    const rangeYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const allYears = [...new Set([...dataYears, ...rangeYears])];
    return allYears.sort((a, b) => b - a).map(String);
  }, [data]);

  const filteredData = useMemo(() => {
    const [start, end] = getDateRange(filter, {
      month: selectedMonth,
      week: selectedWeekStart,
      year: selectedYear,
      start: customStart,
      end: customEnd,
    });
    if (start && end && start > end) return [];
    return data
      .filter((item) => {
        const date = item.parsed_date;
        return !start || !end || (date >= start && date <= end);
      })
      .map((d) => ({
        ...d,
        total_messages: d.messages_sent + d.messages_received,
      }))
      .sort((a, b) => a.parsed_date - b.parsed_date);
  }, [
    data,
    filter,
    selectedMonth,
    selectedWeekStart,
    selectedYear,
    customStart,
    customEnd,
  ]);

  const totalSent = filteredData.reduce((sum, d) => sum + d.messages_sent, 0);
  const totalReceived = filteredData.reduce(
    (sum, d) => sum + d.messages_received,
    0
  );
  const totalGupshup = filteredData
    .reduce((sum, d) => sum + (parseFloat(d.gupshup_fees) || 0), 0)
    .toFixed(2);
  const totalMeta = filteredData
    .reduce((sum, d) => sum + (parseFloat(d.meta_fees) || 0), 0)
    .toFixed(2);

  const messagePieData = useMemo(
    () => [
      { name: "Sent", value: totalSent },
      { name: "Received", value: totalReceived },
    ],
    [totalSent, totalReceived]
  );

  const costPieData = useMemo(() => {
    const gupshupTotal = filteredData.reduce(
      (sum, d) => sum + (parseFloat(d.gupshup_fees) || 0),
      0
    );
    const metaTotal = filteredData.reduce(
      (sum, d) => sum + (parseFloat(d.meta_fees) || 0),
      0
    );
    return [
      { name: "Foodchow Fees", value: gupshupTotal },
      { name: "Meta Fees", value: metaTotal },
    ];
  }, [filteredData]);

  const getImageAsBase64 = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch logo");
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Error fetching logo:", err);
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const logoBase64 = await getImageAsBase64("/logo.png");
    const customerName = user?.company_name || "FOODCHOW";
    const appId = user?.details?.app_id || "WhatsappMarketing";
    const formatNumber = (value) =>
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    const rangeText = (() => {
      if (filter === "Monthly") return selectedMonth;
      if (filter === "Yearly") return selectedYear;
      if (filter === "Weekly") return `Week of ${selectedWeekStart}`;
      if (filter === "Custom") return `${customStart} to ${customEnd}`;
      return "";
    })();

    const columns = [
      { header: "Date", dataKey: "usage_date" },
      { header: "Messages Sent", dataKey: "messages_sent" },
      { header: "Messages Received", dataKey: "messages_received" },
      { header: "Gupshup Fees", dataKey: "gupshup_fees" },
      { header: "Meta Fees", dataKey: "meta_fees" },
    ];

    const rows = filteredData.map((row) => ({
      usage_date: row.usage_date,
      messages_sent: row.messages_sent || 0,
      messages_received: row.messages_received || 0,
      gupshup_fees: row.gupshup_fees
        ? parseFloat(row.gupshup_fees).toFixed(2)
        : "0.00",
      meta_fees: row.meta_fees ? parseFloat(row.meta_fees).toFixed(2) : "0.00",
    }));

    const formattedRows = rows.map((r) => ({
      ...r,
      messages_sent: formatNumber(r.messages_sent),
      messages_received: formatNumber(r.messages_received),
      gupshup_fees: formatNumber(r.gupshup_fees),
      meta_fees: formatNumber(r.meta_fees),
    }));

    const summaryRow = {
      usage_date: "Total",
      messages_sent: formatNumber(
        rows.reduce((sum, r) => sum + r.messages_sent, 0)
      ),
      messages_received: formatNumber(
        rows.reduce((sum, r) => sum + r.messages_received, 0)
      ),
      gupshup_fees: formatNumber(
        rows.reduce((sum, r) => sum + r.gupshup_fees, 0)
      ),
      meta_fees: formatNumber(rows.reduce((sum, r) => sum + r.meta_fees, 0)),
    };

    // Header with logo
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 40, 20, 100, 40);
    } else {
      doc.text("Logo not available", 40, 30);
    }

    doc.setFontSize(12);
    doc.text("301 Milestone Vibrant,", 40, 70);
    doc.text("Udana Darwaja, Ring Road,", 40, 85);
    doc.text("Opposite to Apple Hospital,", 40, 100);
    doc.text("Surat, Gujarat 395002", 40, 115);

    doc.setFontSize(14);
    doc.text(`App Usage Statement for: ${appId}`, 40, 140);
    doc.text(`Date Range: ${rangeText}`, 40, 160);
    doc.setFontSize(12);
    doc.text(`Customer: ${customerName}`, 40, 175);
    doc.text(`App ID: ${appId}`, 300, 175);

    // Main table
    autoTable(doc, {
      columns,
      body: formattedRows,
      startY: 190,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      theme: "grid",
      didDrawPage: (data) => {
        const finalY = data.cursor.y + 10;

        // Summary row
        autoTable(doc, {
          columns,
          body: [summaryRow],
          startY: finalY,
          styles: {
            fontSize: 10,
            fontStyle: "bold",
            fillColor: [240, 240, 240],
          },
          theme: "plain",
          margin: { left: data.settings.margin.left },
          tableLineWidth: 0,
          tableLineColor: 255,
          showHead: "never",
        });

        doc.text(
          "Note: Fees are in INR and include Gupshup and Meta charges.",
          40,
          finalY + 60
        );

        // Footer with page number
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Page ${pageNumber} of ${pageCount}`,
          pageWidth - 60,
          pageHeight - 20
        );
      },
    });

    doc.save(`Foodchow_Report_${rangeText.replace(/ /g, "_")}.pdf`);
  };

  if (loading) {
    return <Loader />;
  }

  const handleUnauthorizedDownload = () => {
    toast.error("You don't have permission to download reports.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  // Campaign details
  const campStatuses = {
    All: broadcasts.length,
    Live: broadcasts.filter((d) => d.status === "Live").length,
    Sent: broadcasts.filter((d) => d.status === "Sent").length,
    Scheduled: broadcasts.filter((d) => d.status === "Scheduled").length,
  };

  const campData = [
    {
      label: "Total Campaign",
      count: campStatuses["All"],
      color: "text-purple-600",
      bg: "bg-purple-600",
      icon: Megaphone,
    },
    {
      label: "Live Campaign",
      count: campStatuses["Live"],
      color: "text-green-600",
      bg: "bg-green-600",
      icon: Radio,
    },
    {
      label: "Sent Campaign",
      count: campStatuses["Sent"],
      color: "text-orange-600",
      bg: "bg-orange-600",
      icon: Send,
    },
    {
      label: "Scheduled Campaign",
      count: campStatuses["Scheduled"],
      color: "text-red-600",
      bg: "bg-red-600",
      icon: CalendarClock,
    },
  ];

  return (
    <div className=" space-y-10 mx-3">


      <div className="flex flex-col md:flex-row md:justify-between gap-4 w-full">
        {/* Filter row */}
        <div className="flex flex-col md:flex-row flex-wrap md:items-center gap-3 w-full">
          {/* Main Filter Select */}
          <label htmlFor="filter-select" className="sr-only">
            Select Filter
          </label>
          <select
            id="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer text-sm font-medium w-full md:w-auto"
            aria-label="Select time filter"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Yearly */}
          {filter === "Yearly" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer text-sm font-medium w-full md:w-auto"
              aria-label="Select year"
            >
              {YEAR_OPTIONS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          )}

          {/* Monthly */}
          {filter === "Monthly" && (
            <MonthPicker
              value={selectedMonth}
              onChange={setSelectedMonth}
              maxMonth={todayMonth}
              label="Select month"
            />
          )}

          {/* Weekly */}
          {filter === "Weekly" && (
            <DatePicker
              value={selectedWeekStart}
              onChange={setSelectedWeekStart}
              maxDate={todayDate}
              label="Select week start"
            />
          )}

          {/* Custom */}
          {filter === "Custom" && (
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <DatePicker
                value={customStart}
                onChange={setCustomStart}
                maxDate={todayDate}
                label="Start date"
              />
              <DatePicker
                value={customEnd}
                onChange={setCustomEnd}
                maxDate={todayDate}
                label="End date"
              />
            </div>
          )}
        </div>

        {/* Download PDF Button */}
        {/* {filteredData.length > 0 && (
          <button
            className="bg-[#0AA89E] hover:bg-[#0AA89E] text-white flex items-center gap-2 px-4 py-2 rounded cursor-pointer"
            onClick={() => {
              if (permissions?.canDownloadReports) {
                handleDownloadPDF();
              } else {
                handleUnauthorizedDownload();
              }
            }}
          >
            Download PDF
          </button>
        )} */}
      </div>

      <div id="analytics-section">
        {filteredData.length === 0 ? (
          <p className="text-center text-gray-500">
            No data available for the selected filter.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <ChartBlock
                title="Total Messaging Volume"
                dataKey="total_messages"
                stroke="#8884d8"
                data={filteredData}
              />

              {/* Cost Distribution */}
              <div className="rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:scale-[1.02] transition">
                <h2 className="text-lg sm:text-xl font-semibold border-b pb-3 border-gray-300 mb-4">
                  Cost Distribution
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={costPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="40%"
                        outerRadius="70%"
                        label={({ name, value }) =>
                          `${name}: ₹${parseFloat(value).toFixed(2)}`
                        }
                      >
                        {costPieData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COST_COLORS[index % COST_COLORS.length]}
                          />
                        ))}
                      </Pie>

                      {/* Center text showing total */}
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm font-semibold"
                      >
                        Total ₹
                        {costPieData
                          .reduce((acc, cur) => acc + cur.value, 0)
                          .toFixed(2)}
                      </text>

                      <Tooltip
                        formatter={(value, name) => [
                          `₹${parseFloat(value).toFixed(2)}`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Custom legend */}
                  <div className="flex flex-col gap-2">
                    {costPieData.map((cost, index) => (
                      <div key={cost.name} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COST_COLORS[index % COST_COLORS.length],
                          }}
                        />
                        <span>
                          {cost.name}: ₹{parseFloat(cost.value).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* Campaign Details */}
              <div className="rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:scale-[1.02] transition">
                <h2 className="text-lg sm:text-xl font-semibold border-b pb-3 border-gray-300 mb-4">
                  Campaign Details
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  {campData.map((camp) => (
                    <div
                      key={camp.label}
                      className="flex items-center justify-between p-3 border-b border-gray-200 last:border-none hover:bg-gray-50 rounded-lg transition"
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon inside colored circle */}
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full bg-opacity-10 ${camp.color}`}
                        >
                          <camp.icon className={`${camp.color} w-4 h-4`} />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-medium text-gray-700">
                            {camp.label}
                          </h3>
                          {camp.subLabel && (
                            <p className="text-xs text-gray-500">{camp.subLabel}</p>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm sm:text-base font-semibold ${camp.color}`}>
                        {camp.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Messaging & Fees Overview */}
            <div className="mb-8">
              <div className="rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  Messaging & Fees Overview
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={filteredData.map((item) => ({
                      ...item,
                      total_fees: item.gupshup_fees + item.meta_fees,
                    }))}
                    className="text-xs"
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="1 2" />

                    <XAxis
                      dataKey="usage_date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      }
                    />
                    <YAxis tickFormatter={(value) => `₹${value.toFixed(2)}`} />

                    <Tooltip
                      formatter={(value, name) => [
                        `₹${parseFloat(value).toFixed(2)}`,
                        name,
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.85rem" }} />

                    {/* Gradient fills */}
                    <defs>
                      <linearGradient id="foodchowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#82ca9d" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="metaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffc658" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#ffc658" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8884d8" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#8884d8" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>

                    {/* Foodchow Fees (was Gupshup Fees) */}
                    <Line
                      type="monotone"
                      dataKey="gupshup_fees"
                      stroke="url(#foodchowGradient)"
                      name="Foodchow Fees"   // ✅ renamed here
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />

                    {/* Meta Fees */}
                    <Line
                      type="monotone"
                      dataKey="meta_fees"
                      stroke="url(#metaGradient)"
                      name="Meta Fees"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />

                    {/* Total Fees */}
                    <Line
                      type="monotone"
                      dataKey="total_fees"
                      stroke="url(#totalGradient)"
                      name="Total Fees"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>


            {/* Message Distribution + Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  Message Distribution
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={messagePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        label
                      >
                        {messagePieData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={MESSAGE_COLORS[index % MESSAGE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} messages`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2">
                    {messagePieData.map((msg, index) => (
                      <div
                        key={msg.name}
                        className="text-sm border px-3 py-2 rounded-md text-center"
                        style={{
                          borderColor:
                            MESSAGE_COLORS[index % MESSAGE_COLORS.length],
                        }}
                      >
                        <span
                          style={{
                            color:
                              MESSAGE_COLORS[index % MESSAGE_COLORS.length],
                          }}
                        >
                          {msg.name} :
                        </span>{" "}
                        <span>{msg.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <ContactPart />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
function ChartBlock({ title, dataKey, stroke, data, multiKeys = [] }) {
  const keysToRender = multiKeys.length > 0 ? multiKeys : [dataKey];

  return (
    <div className="rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition border border-gray-200 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> {/* lighter grid */}
          <XAxis
            dataKey="usage_date"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })
            }
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={(val) =>
              keysToRender.some((k) => k.includes("fees")) ? `₹${val}` : val
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value, name) => {
              if (typeof value === "number") {
                return name.toLowerCase().includes("fees")
                  ? [`₹${value.toFixed(2)}`, name]
                  : [value, name];
              }
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />

          {keysToRender.map((key, idx) => (
            <Line
              key={key}
              type="monotone" // smoother curve
              dataKey={key}
              stroke={stroke || COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }} // small filled dots
              activeDot={{ r: 6, strokeWidth: 2 }}
              name={key.replace(/_/g, " ")}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];
