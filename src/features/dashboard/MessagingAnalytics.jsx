import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import React, { useEffect, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from "recharts";
import { parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { getPermissions } from "../../utils/getPermissions";
import Loader from "../../components/Loader";
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

  // ✅ Define today's date & month for max attributes
  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const todayMonth = todayDate.slice(0, 7);

  useEffect(() => {
    if (usageHistory && usageHistory.length > 0) {
      const formatted = usageHistory.map((item) => ({
        customer_id: item.customer_id,
        usage_date: new Date(item.usage_date).toISOString().split("T")[0],
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
    if (data.length > 0) {
      const latest = data[data.length - 1];
      const usageDate = latest.usage_date;
      const dateObj = new Date(usageDate);

      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");

      setSelectedMonth(`${yyyy}-${mm}`);
      setSelectedWeekStart(`${yyyy}-${mm}-${dd}`);
      setSelectedYear(`${yyyy}`);
      setCustomStart(`${yyyy}-${mm}-01`);
      setCustomEnd(`${yyyy}-${mm}-${dd}`);
    }
  }, [data]);

  const YEAR_OPTIONS = useMemo(() => {
    const years = data.map((d) => new Date(d.usage_date).getFullYear());
    return Array.from(new Set(years))
      .sort((a, b) => b - a)
      .map(String);
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
        const date = parseISO(item.usage_date);
        return (
          !isNaN(date) && (!start || !end || (date >= start && date <= end))
        );
      })
      .map((d) => ({
        ...d,
        total_messages: d.messages_sent + d.messages_received,
      }))
      .sort((a, b) => new Date(a.usage_date) - new Date(b.usage_date));
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
  const totalGupshup = filteredData.reduce((sum, d) => sum + d.gupshup_fees, 0);
  const totalMeta = filteredData.reduce((sum, d) => sum + d.meta_fees, 0);

  const messagePieData = useMemo(
    () => [
      { name: "Sent", value: totalSent },
      { name: "Received", value: totalReceived },
    ],
    [totalSent, totalReceived]
  );

  const costPieData = useMemo(
    () => [
      { name: "Gupshup Fees", value: totalGupshup },
      { name: "Meta Fees", value: totalMeta },
    ],
    [totalGupshup, totalMeta]
  );

  const getImageAsBase64 = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
      { header: "Session Out", dataKey: "session_out" },
      { header: "Session In", dataKey: "session_in" },
      { header: "Template FEP", dataKey: "template_fep" },
      { header: "Template FTC", dataKey: "template_ftc" },
      { header: "Util.", dataKey: "template_util" },
      { header: "Auth.", dataKey: "template_auth" },
      { header: "Mark.", dataKey: "template_mark" },
      { header: "Serv.", dataKey: "template_service" },
      { header: "GS Fee", dataKey: "gupshup_fees" },
      { header: "WA Fee", dataKey: "meta_fees" },
    ];

    const rows = filteredData.map((row) => ({
      usage_date: row.usage_date,
      session_out: row.session_out || 0,
      session_in: row.session_in || 0,
      template_fep: row.template_fep || 0,
      template_ftc: row.template_ftc || 0,
      template_util: row.template_util || 0,
      template_auth: row.template_auth || 0,
      template_mark: row.template_mark || 0,
      template_service: row.template_service || 0,
      gupshup_fees: row.gupshup_fees || 0,
      meta_fees: row.meta_fees || 0,
    }));

    const formattedRows = rows.map((r) => ({
      ...r,
      session_out: formatNumber(r.session_out),
      session_in: formatNumber(r.session_in),
      template_fep: formatNumber(r.template_fep),
      template_ftc: formatNumber(r.template_ftc),
      template_util: formatNumber(r.template_util),
      template_auth: formatNumber(r.template_auth),
      template_mark: formatNumber(r.template_mark),
      template_service: formatNumber(r.template_service),
      gupshup_fees: formatNumber(r.gupshup_fees),
      meta_fees: formatNumber(r.meta_fees),
    }));

    const summaryRow = {
      usage_date: "Total",
      session_out: formatNumber(
        rows.reduce((sum, r) => sum + r.session_out, 0)
      ),
      session_in: formatNumber(rows.reduce((sum, r) => sum + r.session_in, 0)),
      template_fep: formatNumber(
        rows.reduce((sum, r) => sum + r.template_fep, 0)
      ),
      template_ftc: formatNumber(
        rows.reduce((sum, r) => sum + r.template_ftc, 0)
      ),
      template_util: formatNumber(
        rows.reduce((sum, r) => sum + r.template_util, 0)
      ),
      template_auth: formatNumber(
        rows.reduce((sum, r) => sum + r.template_auth, 0)
      ),
      template_mark: formatNumber(
        rows.reduce((sum, r) => sum + r.template_mark, 0)
      ),
      template_service: formatNumber(
        rows.reduce((sum, r) => sum + r.template_service, 0)
      ),
      gupshup_fees: formatNumber(
        rows.reduce((sum, r) => sum + r.gupshup_fees, 0)
      ),
      meta_fees: formatNumber(rows.reduce((sum, r) => sum + r.meta_fees, 0)),
    };

    // ✅ Header with logo only
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 40, 20, 100, 40); 
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

    // ✅ Main table
    autoTable(doc, {
      columns,
      body: formattedRows,
      startY: 190,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      theme: "grid",
      didDrawPage: (data) => {
        const finalY = data.cursor.y + 10;

        // ✅ Summary row
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
          "Abbreviations: Util. - Utility, Auth. - Authentication, Mark. - Marketing, Serv. - Service",
          40,
          finalY + 60
        );
        doc.text(
          "Template types include Marketing, Authentication, Utility, Service and Free Templates",
          40,
          finalY + 75
        );

        // ✅ Footer with page number
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

  return (
    
    <div className="p-6 space-y-10">
          <ToastContainer 
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
      {/* Download PDF Button */}
      {filteredData.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            className="bg-[#24AEAE] hover:bg-[#24AEAE] text-white px-4 py-2 rounded shadow cursor-pointer"
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
        </div>
      )}
      {/* ✅ Filter Controls */}
      <div id="analytics-section">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {filter === "Yearly" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              {YEAR_OPTIONS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          )}

          {filter === "Monthly" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={todayMonth} 
              className="border px-3 py-2 rounded"
            />
          )}

          {filter === "Weekly" && (
            <input
              type="date"
              value={selectedWeekStart}
              onChange={(e) => setSelectedWeekStart(e.target.value)}
              max={todayDate} 
              className="border px-3 py-2 rounded"
            />
          )}

          {filter === "Custom" && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={todayDate}
                className="border px-3 py-2 rounded"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                max={todayDate} 
                className="border px-3 py-2 rounded"
              />
            </>
          )}
        </div>

        {filteredData.length === 0 ? (
          <p className="text-center text-gray-500">
            No data available for the selected filter.
          </p>
        ) : (
          <>
            <ChartBlock
              title="Total Messaging Volume"
              dataKey="total_messages"
              stroke="#8884d8"
              data={filteredData}
            />
            <ChartBlock
              title="Gupshup Fees"
              dataKey="gupshup_fees"
              stroke="#82ca9d"
              data={filteredData}
            />
            <ChartBlock
              title="Meta Fees"
              dataKey="meta_fees"
              stroke="#ffc658"
              data={filteredData}
            />

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Message Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={messagePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
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
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Cost Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={costPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {costPieData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COST_COLORS[index % COST_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`₹${value}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChartBlock({ title, dataKey, stroke, data }) {
  const isCurrency = dataKey.includes("fees");

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="usage_date" />
          <YAxis tickFormatter={(val) => (isCurrency ? `₹${val}` : val)} />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? isCurrency
                  ? `₹${value}`
                  : value
                : value
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
  );
}
