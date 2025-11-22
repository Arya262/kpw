import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import vendor from "../../assets/Vector.png";
import Tooltip from "../../components/Tooltip";
import OptionsDropdown from "../shared/OptionsDropdown";
const FlowTable = ({
  savedFlows,
  loadingFlow,
  onLoadFlow,
  onDeleteFlow,
  onAddFlow,
}) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedFlows, setSelectedFlows] = useState({});
  
  const handleEditFlow = (flow) => {
    onLoadFlow(flow);
  };

  // Handle delete flow
  const handleDeleteFlow = (flow) => {
    if (window.confirm(`Are you sure you want to delete flow "${flow.name}"?`)) {
      onDeleteFlow(flow.id);
    }
  };

  // Handle toggle active status
  const handleToggleStatus = (flow) => {
    if (typeof onToggleActiveStatus === "function") {
      onToggleActiveStatus(flow.id, !flow.isActive);
    }
  };
  const transformedFlows = useMemo(() => {
    if (!savedFlows || !Array.isArray(savedFlows)) {
      return [];
    }
    
    return savedFlows.map((flow) => ({
      ...flow,
      status: flow.isActive
        ? "active"
        : flow.isActive === false
        ? "inactive"
        : "active",
      id: flow.flow_id || flow.id,
    }));
  }, [savedFlows]);

  // Computed filter counts
  const filteredCounts = useMemo(() => {
    const active = transformedFlows.filter(
      (f) => f.status?.toLowerCase() === "active"
    ).length;
    const inactive = transformedFlows.filter(
      (f) => f.status?.toLowerCase() === "inactive"
    ).length;
    return {
      all: transformedFlows.length,
      active,
      inactive,
    };
  }, [transformedFlows]);

  const filters = [
    { label: "All", count: filteredCounts.all },
    { label: "Active", count: filteredCounts.active },
    { label: "Inactive", count: filteredCounts.inactive },
  ];

  const statusFilteredFlows = useMemo(() => {
    if (activeFilter === "All") {
      return transformedFlows;
    }
    
    return transformedFlows.filter(
      (f) => f.status?.toLowerCase().trim() === activeFilter.toLowerCase()
    );
  }, [transformedFlows, activeFilter]);

  const displayedFlows = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return statusFilteredFlows.filter((f) => 
      f.name?.toLowerCase().includes(term)
    );
  }, [statusFilteredFlows, searchTerm]);

  // Update selectAll based on current selection
  useEffect(() => {
    const total = displayedFlows.length;
    const selected = Object.values(selectedFlows).filter(Boolean).length;
    setSelectAll(selected === total && total > 0);
  }, [selectedFlows, displayedFlows.length]);

  // Handle Select All checkbox change
  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    const newSelected = {};
    if (checked) {
      displayedFlows.forEach((flow, idx) => {
        newSelected[idx] = true;
      });
    }
    setSelectedFlows(newSelected);
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (idx, event) => {
    setSelectedFlows((prev) => ({
      ...prev,
      [idx]: event.target.checked,
    }));
  };

  return (
    <div className="overflow-x-auto">
      {/* Header Cards */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="w-[350px] h-[124px] p-5 rounded-xl bg-white flex items-center gap-6 shadow">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Total Flows</div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredCounts.all}
            </div>
          </div>
        </div>
        <div className="w-[350px] h-[124px] p-5 rounded-xl bg-white flex items-center gap-6 shadow">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">
              Active Flows
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredCounts.active}
            </div>
          </div>
        </div>
        <div className="w-[350px] h-[124px] p-5 rounded-xl bg-white flex items-center gap-6 shadow">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <div className="w-8 h-8 bg-red-500 rounded-full"></div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">
              Inactive Flows
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredCounts.inactive}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full font-sans rounded-[16px] scrollbar-hide scroll-smooth bg-white shadow-[0px_0.91px_3.66px_0px_#00000042] overflow-hidden">
        {/* Header Filters and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-2 sm:p-3 md:p-4">
          <div className="flex-shrink-0 pl-2 pr-3">
            <p className="font-semibold text-base sm:text-lg md:text-xl text-nowrap">
              Flows List
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-grow w-full">
            <div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto">
              {filters.map((f, i) => (
                <button
                  key={i}
                  className={`px-4 py-2 min-h-[40px] rounded-md text-sm font-medium transition 
                    ${
                      activeFilter === f.label
                        ? "bg-[#0AA89E] text-white"
                        : "text-gray-700 hover:text-[#0AA89E]"
                    }`}
                  onClick={() => setActiveFilter(f.label)}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
            <div className="flex-grow max-w-[400px] relative ml-auto">
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search flow by name..."
                className="pl-3 pr-7 py-1.5 sm:py-2 border border-gray-300 text-sm sm:text-base rounded-md w-full focus:outline-none focus:ring-1 focus:ring-[#0AA89E] focus:border-[#0AA89E] placeholder:text-sm sm:placeholder:text-base"
              />
            </div>
            <Tooltip text="Add a new flow" position="bottom">
              <button
                className="ml-2 flex items-center gap-2 px-4 py-2 rounded cursor-pointer bg-[#0AA89E] text-white hover:bg-[#099990]"
                onClick={onAddFlow}
              >
                <img src={vendor} alt="plus sign" className="w-5 h-5" />
                Add New Flow
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[900px] bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
            <table className="w-full text-sm text-center overflow-hidden table-auto">
              <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
                <tr>
                  <th className="px-2 py-3 sm:px-6">
                    <div className="flex items-center justify-center h-full">
                      <input
                        type="checkbox"
                        className="form-checkbox w-4 h-4"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                      />
                    </div>
                  </th>
                  <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Created Date
                  </th>
                  <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Flow Name
                  </th>
                  <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Status
                  </th>
                  <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
                {(() => {
                  const flowsToShow = displayedFlows.length > 0 ? displayedFlows : (savedFlows || []);
                  
                  if (flowsToShow.length === 0) {
                    return (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-500">
                          No flows found.
                        </td>
                      </tr>
                    );
                  }
                  
                  return flowsToShow.map((flow, idx) => (
                    <tr
                      key={flow.id || idx}
                      className="border-t border-b border-b-[#C3C3C3] hover:bg-gray-50 text-md"
                    >
                      <td className="px-2 py-4 sm:px-4">
                        <div className="flex items-center justify-center h-full">
                          <input
                            type="checkbox"
                            className="form-checkbox w-4 h-4"
                            checked={!!selectedFlows[idx]}
                            onChange={(e) => handleCheckboxChange(idx, e)}
                          />
                        </div>
                      </td>
                      <td className="px-2 py-4 sm:px-4 sm:py-4 whitespace-nowrap text-[12px] sm:text-[16px] text-gray-700">
                        {new Date(flow.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700">
                        {flow.name || "-"}
                      </td>
                      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-green-600">
                        {flow.status}
                      </td>
                      <td className="relative py-4">
                        <div className="flex justify-center">
                          <OptionsDropdown
                            items={[
                              {
                                label: 'Edit',
                                icon: <Edit2 className="w-4 h-4" />,
                                onClick: () => handleEditFlow(flow),
                                className: 'text-gray-700 hover:bg-gray-100',
                              },
                              {
                                label: flow.status?.toLowerCase() === 'active' ? 'Deactivate' : 'Activate',
                                icon: flow.status?.toLowerCase() === 'active' ? 
                                  <XCircle className="w-4 h-4 text-yellow-500" /> : 
                                  <CheckCircle className="w-4 h-4 text-green-500" />,
                                onClick: () => handleToggleStatus(flow),
                                className: flow.status?.toLowerCase() === 'active' ? 
                                  'text-yellow-700 hover:bg-yellow-50' : 
                                  'text-green-700 hover:bg-green-50',
                              },
                              {
                                label: 'Delete',
                                icon: <Trash2 className="w-4 h-4" />,
                                onClick: () => handleDeleteFlow(flow),
                                className: 'text-red-600 hover:bg-red-50',
                              },
                            ]}
                            buttonClassName="p-2 rounded-full hover:bg-gray-100"
                            menuButton={
                              <svg
                                className="w-5 h-5 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 5v.01M12 12v.01M12 19v.01"
                                />
                              </svg>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowTable;