import React, { useState, useMemo, useEffect, useRef } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationDialog from "../shared/DeleteConfirmationDialog";
import { toast } from "react-toastify";
import { Edit2, Trash2 } from "lucide-react";
import { formatDate } from "../../utils/formatters";
import FilterBar from "../broadcast/components/FilterBar";
import SearchBar from "../broadcast/components/SearchBar";
const Table = ({
  templates = [],
  onDelete,
  onEdit,
  canEdit,
  canDelete,
  pagination,
  totalRecords,
  searchTerm,
  onSearchChange,
  fetchAllTemplates, 
}) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [menuOpen, setMenuOpen] = useState(null);
  const [shouldFlipUp, setShouldFlipUp] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false); 
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);
  const dropdownRefs = useRef({});
  const rowRefs = useRef({});

const filteredCounts = useMemo(() => {
    const approved = templates.filter(t => t?.status?.toLowerCase() === "approved").length;
    const pending = templates.filter(t => t?.status?.toLowerCase() === "pending").length;
    const failed = templates.filter(t => t?.status?.toLowerCase() === "failed").length;
    return {
      all: totalRecords || templates.length,
      approved,
      pending,
      failed,
    };
  }, [templates, totalRecords]);

  const filters = [
    { label: "All", count: filteredCounts.all },
    { label: "Approved", count: filteredCounts.approved },
    { label: "Pending", count: filteredCounts.pending },
    { label: "Failed", count: filteredCounts.failed },
  ];

  // ✅ status filter applied locally
  const displayedTemplates = useMemo(() => {
    if (!activeFilter || activeFilter === "All") return templates;
    const filterValue = activeFilter?.toLowerCase()?.trim() || '';
    return templates.filter(
      (t) => t?.status?.toLowerCase()?.trim() === filterValue
    );
  }, [templates, activeFilter]);

  // ✅ selection logic (only for current page mode)
  useEffect(() => {
    if (selectAllAcrossPages) return;
    const total = displayedTemplates.length;
    const selected = displayedTemplates.filter(t => selectedRows[t.id]).length;
    setSelectAll(selected === total && total > 0);
  }, [selectedRows, displayedTemplates, selectAllAcrossPages]);

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    setSelectAllAcrossPages(checked);
    // Reset selection map; in across-pages mode we track only exceptions (unchecked -> false)
    // and in normal mode we track checked items (true)
    setSelectedRows({});
  };

  const handleCheckboxChange = (template, event) => {
    const isChecked = event.target.checked;
    const id = template.id;
    setSelectedRows((prev) => {
      const updated = { ...prev };
      if (selectAllAcrossPages) {
        if (!isChecked) updated[id] = false;
        else delete updated[id];
      } else {  
        if (isChecked) updated[id] = true;
        else delete updated[id];
      }
      return updated;
    });
  };

  const getDeletePayload = async () => {
    if (selectAllAcrossPages) {
      const exceptions = Object.entries(selectedRows)
        .filter(([_, v]) => v === false)
        .map(([id]) => id);
      
      const allTemplates = await fetchAllTemplates(searchTerm);
      return allTemplates
        .filter(template => !exceptions.includes(template.id) && template.id && template.element_name)
        .map(template => ({
          id: template.id,
          element_name: template.element_name,
          _selectedIds: [template.id]
        }));
    } else {
      return displayedTemplates
        .filter(t => selectedRows[t.id])
        .map(t => ({
          id: t.id,
          element_name: t.element_name || t.elementName,
          _selectedIds: [t.id]
        }));
    }
  };

  // ✅ bulk delete trigger
  const handleDeleteSelected = async () => {
    if (!canDelete) {
      toast.error("You do not have permission to delete templates.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const payload = await getDeletePayload();
      
      if (payload.length === 0) {
        toast.info(
          selectAllAcrossPages 
            ? 'No templates available for deletion'
            : 'No templates selected for deletion',
          { autoClose: 3000 }
        );
        return;
      }

      setSelectedTemplate(payload[0]);
      setShowDeleteDialog(true);
    } catch (error) {
      console.error('Error preparing delete payload:', error);
      toast.error("An error occurred while preparing to delete templates.", { autoClose: 3000 });
    }
  };

  const handleDeleteClick = (template) => {
    if (!canDelete) return;
    setSelectedTemplate({
      ...template,
      _selectedIds: [template.id],
      element_name: template.element_name || template.elementName
    });
    setShowDeleteDialog(true);
    setMenuOpen(null);
  };

  const handleEditClick = (template) => {
    if (!canEdit) {
      toast.error("You do not have permission to edit templates.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    setMenuOpen(null);
    if (onEdit) onEdit(template);
  };

  const handleDeleteConfirm = async () => {
  if (!selectedTemplate) return;
  
  try {
    setIsDeleting(true);
    
    // Get the latest payload with all selected templates
    const payload = await getDeletePayload();
    
    if (payload.length === 0) {
      setShowDeleteDialog(false);
      return;
    }

    // Delete all selected templates in parallel
    const deletePromises = payload.map(template => 
      onDelete(template)
    );
    
    const results = await Promise.all(deletePromises);
    const allSucceeded = results.every(Boolean);
    
    if (allSucceeded) {
      setSelectedRows({});
      setSelectAll(false);
      setSelectAllAcrossPages(false);
      
     
      // const message = payload.length === 1 
      //   ? "Template deleted successfully" 
      //   : `${payload.length} templates deleted successfully`;
      
      // toast.success(message, {
      //   position: "top-right",
      //   autoClose: 3000,
      // });
      
      // Refresh the table
      if (pagination?.onPageChange) {
        const currentItemsCount = templates.length;
        if (currentItemsCount <= payload.length && pagination.currentPage > 1) {
          pagination.onPageChange(pagination.currentPage - 1);
        } else {
          pagination.onPageChange(pagination.currentPage);
        }
      }
    }
  } catch (error) {
    console.error("Error in handleDeleteConfirm:", error);
    toast.error("Failed to delete templates", {
      position: "top-right",
      autoClose: 3000,
    });
  } finally {
    setIsDeleting(false);
    setShowDeleteDialog(false);
    setSelectedTemplate(null);
  }
};

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setSelectedTemplate(null);
  };

  const toggleMenu = (index) => {
    setMenuOpen(menuOpen === index ? null : index);
    const rowEl = rowRefs.current[index];
    const dropdownEl = dropdownRefs.current[index];
    if (rowEl) {
      const rect = rowEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const dropdownHeight = dropdownEl ? dropdownEl.offsetHeight : 120;
      const spaceBelow = windowHeight - rect.bottom;
      setShouldFlipUp((prev) => ({
        ...prev,
        [index]: spaceBelow < dropdownHeight,
      }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const refs = Object.values(dropdownRefs.current);
      if (refs.some((ref) => ref && ref.contains(event.target))) return;
      setMenuOpen(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendCampaign = (template) => {
    if (template.status?.toLowerCase() !== "approved") {
      toast.error("Only approved templates can be used to send campaigns.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    navigate("/broadcast", {
      state: { selectedTemplate: template, openForm: true },
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center shadow-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          <div className="w-full sm:w-auto overflow-x-auto sm:overflow-x-visible scrollbar-hide">
            <FilterBar
              filters={filters}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </div>
          <div className="w-full sm:w-auto">
            <SearchBar search={searchTerm} setSearch={onSearchChange} />
          </div>
        </div>
      </div>
      <div className="w-full font-sans scrollbar-hide scroll-smooth bg-white shadow-[0px_0.91px_3.66px_0px_#00000042] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px] bg-white shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
            <table className="w-full text-sm text-center table-auto">
              <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
                <tr>
                  <th className="px-2 py-3 sm:px-6">
                    <div className="flex items-center justify-center h-full">
                      <input
                        type="checkbox"
                        className="form-checkbox w-4 h-4"
                        checked={selectAllAcrossPages ? true : selectAll}
                        onChange={handleSelectAllChange}
                      />
                    </div>
                  </th>
                  {(selectAllAcrossPages || Object.values(selectedRows).some(Boolean)) ? (
                    <th colSpan="6" className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {(() => {
                            if (selectAllAcrossPages) {
                              const total = totalRecords || templates.length;
                              const unselectedCount = Object.values(selectedRows).filter(v => v === false).length;
                              return `${total - unselectedCount} template(s) selected across pages`;
                            } else {
                              const count = displayedTemplates.filter(t => selectedRows[t.id]).length;
                              return `${count} template(s) selected`;
                            }
                          })()}
                        </span>
                        <button
                          onClick={handleDeleteSelected}
                          disabled={isDeleting}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? (
                            <>
                              <svg
                                className="animate-spin h-3 w-3 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Deleting...
                            </>
                          ) : (
                            "Delete Selected"
                          )}
                        </button>
                      </div>
                    </th>
                  ) : (
                    <>
                      <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                        Created Date
                      </th>
                      <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                        Status
                      </th>
                      <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                        Template Name
                      </th>
                      <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                        Type
                      </th>
                      <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                        Template Type
                      </th>
                      <th className="px-2 py-3 sm:px-6 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                        Action
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {displayedTemplates.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-4 text-gray-500 font-medium"
                    >
                      {/* <img
                        src="/no_data.14591486.svg"
                        alt="No data available"
                        className="w-full h-70 mb-4 opacity-80"
                      /> */}
                      No templates found.
                    </td>
                  </tr>
                ) : (
                  displayedTemplates.map((template, idx) => (
                    <tr
                      key={template.id || idx}
                      ref={(el) => (rowRefs.current[idx] = el)}
                      className="border-t border-b border-b-[#C3C3C3] hover:bg-gray-50 text-md"
                    >
                      <td className="px-2 py-4 sm:px-4">
                        <div className="flex items-center justify-center h-full">
                          <input
                            type="checkbox"
                            className="form-checkbox w-4 h-4"
                            checked={selectAllAcrossPages ? selectedRows[template.id] !== false : !!selectedRows[template.id]}
                            onChange={(e) => handleCheckboxChange(template, e)}
                          />
                        </div>
                      </td>
                      <td className="px-2 py-4 sm:px-4 sm:py-4 whitespace-nowrap text-[12px] sm:text-[16px] text-gray-700 font-medium">
                        {formatDate(template.created_on)}
                      </td>
                      <td className="px-2 py-4 text-[12px] sm:text-[16px] font-semibold rounded text-center">
                        <span
                          className={`px-3 py-1 rounded-full inline-block text-center min-w-[100px] font-medium
                                      shadow-sm transition-colors duration-200
                                      ${
                                        template.status?.toLowerCase() === "approved"
                                          ? "text-green-800 bg-green-200"
                                          : template.status?.toLowerCase() === "pending"
                                          ? "text-yellow-800 bg-yellow-200"
                                          : template.status?.toLowerCase() === "failed"
                                          ? "text-red-800 bg-red-200"
                                          : "text-gray-800 bg-gray-200"
                                      }
                                    `}>
                          {template.status}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700 font-medium">
                        {template.element_name || "-"}
                      </td>
                      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700 font-medium">
                        {template.template_type
                          ? template.template_type.charAt(0).toUpperCase() +
                            template.template_type.slice(1)
                          : "-"}
                      </td>
                      <td className="px-2 py-4 text-[12px] sm:text-[16px] text-gray-700 font-medium">
                        {template.category
                          ? template.category.charAt(0).toUpperCase() +
                            template.category.slice(1)
                          : "-"}
                      </td>
                      <td className="relative py-4">
                        <div
                          ref={(el) => (dropdownRefs.current[idx] = el)}
                          className="flex justify-center">
                          <button
                            onClick={() => handleSendCampaign(template)}
                            disabled={
                              template.status?.toLowerCase() !== "approved"
                            }
                            className={`flex items-center gap-2 bg-[#0AA89E] text-white px-3 py-2 rounded-full whitespace-nowrap mr-2 cursor-pointer ${
                              template.status?.toLowerCase() !== "approved"
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-[#088f87]"
                            }`}
                            aria-label={`Send message to ${template.element_name}`}
                            title={
                              template.status?.toLowerCase() !== "approved"
                                ? "Only approved templates can be sent"
                                : "Send a campaign using this template"
                            }>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 transform rotate-45"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                              aria-hidden="true">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 12h14M12 5l7 7-7 7"
                              />
                            </svg>
                            <span className="text-sm font-medium">
                              Send Campaigns
                            </span>
                          </button>
                          {/* Delete icon button */}
                          <button
                            onClick={() => handleDeleteClick(template)}
                            className="text-red-600 hover:bg-red-100 px-2 py-1 rounded hover:cursor-pointer"
                            aria-label={`Delete ${template.element_name}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination */}
        {pagination}
      </div>
      <DeleteConfirmationDialog
        showDialog={showDeleteDialog}
        title="Delete Template"
        message={
          selectedTemplate?._selectedIds?.length > 1
            ? `Are you sure you want to delete ${selectedTemplate._selectedIds.length} selected templates? This action cannot be undone.`
            : `Are you sure you want to delete "${selectedTemplate?.element_name}"? This action cannot be undone.`
        }
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Table;