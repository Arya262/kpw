import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useAuth } from "../../context/AuthContext";
import searchIcon from "../../assets/search.png";
import FilterBar from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import BroadcastTable from "./components/BroadcastTable";
import { API_ENDPOINTS } from "../../config/api";

const BroadcastDashboard = forwardRef(
  (
    {
      onBroadcastsUpdate,
      selectAll,
      handleSelectAllChange,
      selectedRows,
      handleCheckboxChange,
    },
    ref
  ) => {
    const [search, setSearch] = useState("");
    const [isMobileView, setIsMobileView] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");
    const [menuOpen, setMenuOpen] = useState(null);
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchBroadcasts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_ENDPOINTS.BROADCASTS.GET_ALL}?customer_id=${user?.customer_id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(`Failed to fetch broadcasts: ${errorDetails}`);
        }

        const data = await response.json();
        const newBroadcasts = Array.isArray(data.broadcasts)
          ? data.broadcasts
          : [];
        setBroadcasts(newBroadcasts);

        if (onBroadcastsUpdate) {
          onBroadcastsUpdate(newBroadcasts);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching broadcasts:', err);
        setError('Unable to load broadcasts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      fetchBroadcasts,
    }));

    useEffect(() => {
      fetchBroadcasts();
    }, []);

    const filteredData = broadcasts.filter((broadcast) => {
      const name = broadcast.broadcast_name || "";
      const messageType = broadcast.message_type || "";
      const searchText = search.toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchText) ||
        messageType.toLowerCase().includes(searchText);

      const matchesFilter =
        activeFilter === "All" || broadcast.status === activeFilter;

      return matchesSearch && matchesFilter;
    });

    const statuses = {
      All: broadcasts.length,
      Live: broadcasts.filter((d) => d.status === "Live").length,
      Sent: broadcasts.filter((d) => d.status === "Sent").length,
      Scheduled: broadcasts.filter((d) => d.schedule === "Scheduled").length,
    };

    const filters = [
      {
        label: "All",
        count: statuses["All"],
        color: "bg-[#0AA89E]",
        width: "w-[90px]",
      },
      {
        label: "Live",
        count: statuses["Live"],
        color: "bg-[#0AA89E]",
        width: "w-[120px]",
      },
      {
        label: "Sent",
        count: statuses["Sent"],
        color: "bg-[#0AA89E]",
        width: "w-[120px]",
      },
      {
        label: "Scheduled",
        count: statuses["Scheduled"],
        color: "bg-[#0AA89E]",
        width: "w-[130px]",
      },
    ];
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

    const handleDelete = async (idx) => {
      // Delete is currently disabled
      return;

      // The original delete logic is commented out below
      /*
  try {
    const broadcastToDelete = filteredData[idx];
    const response = await fetch(
      `http://next.tenacioustechies.com.au//broadcasts/${broadcastToDelete.id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete broadcast");
    }

    const newBroadcasts = broadcasts.filter((b) => b.id !== broadcastToDelete.id);
    setBroadcasts(newBroadcasts);
    if (onBroadcastsUpdate) {
      onBroadcastsUpdate(newBroadcasts);
    }
    setMenuOpen(null);
  } catch (err) {
    setError(err.message);
  }
  */
    };

    return (
      <div
        className={`w-full ${
          broadcasts.length > 0 ? "bg-white shadow-sm" : ""
        } rounded-xl mt-4 shadow-sm min-h-fit`}
      >
        <div className="flex items-center shadow-2xl p-4">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide w-full justify-between">
            <FilterBar
              filters={filters}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
            <div className="block md:block lg:hidden">
              <button className="flex items-center justify-center h-10 w-10">
                <img
                  src={searchIcon}
                  alt="Search"
                  className="w-5 h-5 opacity-60"
                />
              </button>
            </div>
            <SearchBar search={search} setSearch={setSearch} />
          </div>
        </div>

        <BroadcastTable
          filteredData={filteredData}
          selectAll={selectAll}
          handleSelectAllChange={handleSelectAllChange}
          selectedRows={selectedRows}
          handleCheckboxChange={handleCheckboxChange}
          menuOpen={menuOpen}
          toggleMenu={toggleMenu}
          handleDelete={handleDelete}
          loading={loading}
          error={error}
        />
      </div>
    );
  }
);

export default BroadcastDashboard;
