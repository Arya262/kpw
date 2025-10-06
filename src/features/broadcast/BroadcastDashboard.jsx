import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { useAuth } from "../../context/AuthContext";
import FilterBar from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import BroadcastTable from "./components/BroadcastTable";
import { API_ENDPOINTS } from "../../config/api";
import Pagination from "../shared/Pagination";
import axios from "axios";

const BroadcastDashboard = forwardRef(({ onBroadcastsUpdate }, ref) => {
  const [search, setSearch] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [menuOpen, setMenuOpen] = useState(null);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const { user } = useAuth();

  const fetchBroadcasts = async (page = 1, limit = 10, search = "") => {
    if (!user?.customer_id) return;
 
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(API_ENDPOINTS.BROADCASTS.GET_ALL, {
        params: {
          customer_id: user?.customer_id,
          page,
          limit,
          ...(search ? { search } : {}),
        },
        withCredentials: true,
        validateStatus: (status) => status < 500,
      });
      console.log("📩 Full API Response:", response.data);

      if (response.status >= 400) {
        throw new Error(response.data?.message || "Failed to fetch broadcasts");
      }

      const result = response.data.data;
      const broadcastsData = Array.isArray(result) ? result : [];
      setBroadcasts(broadcastsData);

      const paginationData = response.data.pagination || {};
      setPagination({
        currentPage: paginationData.page || page,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.totalRecords || 0,
        itemsPerPage: paginationData.limit || limit,
      });

      if (onBroadcastsUpdate) {
        onBroadcastsUpdate({
          broadcasts: broadcastsData,
          pagination: {
            currentPage: paginationData.page || page,
            totalPages: paginationData.totalPages || 1,
            totalRecords: paginationData.totalRecords || 0,
            itemsPerPage: paginationData.limit || limit,
          },
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch broadcasts";
      console.error("❌ Error fetching broadcasts:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      itemsPerPage: newItemsPerPage,
    }));
  };

  useImperativeHandle(ref, () => ({
    fetchBroadcasts,
  }));

  useEffect(() => {
    if (search) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBroadcasts(pagination.currentPage, pagination.itemsPerPage, search);
    }, 400);
    return () => clearTimeout(timeout);
  }, [pagination.currentPage, pagination.itemsPerPage, search, user?.customer_id]);

  const statuses = broadcasts.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      acc.All++;
      return acc;
    },
    { All: 0, Live: 0, Sent: 0, Scheduled: 0 }
  );

  const filters = [
    { label: "All", count: statuses["All"], color: "bg-[#0AA89E]", width: "w-[90px]" },
    { label: "Live", count: statuses["Live"], color: "bg-[#0AA89E]", width: "w-[120px]" },
    { label: "Sent", count: statuses["Sent"], color: "bg-[#0AA89E]", width: "w-[120px]" },
    { label: "Scheduled", count: statuses["Scheduled"], color: "bg-[#0AA89E]", width: "w-[130px]" },
  ];

  const filteredData = useMemo(() => {
    const searchText = search.toLowerCase();
    return broadcasts.filter((broadcast) => {
      const name = broadcast.broadcast_name?.toLowerCase() || "";
      const type = broadcast.message_type?.toLowerCase() || "";
      const matchesSearch = name.includes(searchText) || type.includes(searchText);
      const matchesFilter = activeFilter === "All" || broadcast.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [broadcasts, search, activeFilter]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1000);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = (idx) => {
    setMenuOpen(menuOpen === idx ? null : idx);
  };

  return (
    <div
      className={`w-full ${broadcasts.length > 0 ? "bg-white shadow-sm" : ""} rounded-xl mt-4 shadow-sm min-h-fit`}
    >
      <div className="flex flex-col p-4 sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
        {/* FilterBar */}
        <div className="w-full sm:w-auto overflow-x-auto sm:overflow-x-visible scrollbar-hide">
          <FilterBar
            filters={filters}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </div>

        {/* SearchBar */}
        <div className="w-full sm:w-auto">
          <SearchBar search={search} setSearch={setSearch} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md m-4">
          {error}
        </div>
      )}

      <BroadcastTable
        filteredData={filteredData}
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        loading={loading}
        error={error}
      />

      {!loading && pagination.totalItems > 0 && (
        <div className="border-t border-gray-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            itemsPerPage={pagination.itemsPerPage}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
});

export default BroadcastDashboard;
