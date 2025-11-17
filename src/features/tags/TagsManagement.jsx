import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Tag, Plus, Edit, Trash2, Search, X, Eye } from "lucide-react";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toastConfig";
import CreateTagForm from "./CreateTagForm";
import vendor from "../../assets/Vector.png";

const TagsManagement = () => {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState({});
  const hasSelection = Object.keys(selectedIds).length > 0;

  // Toggle tag active status locally (frontend-only mock)
  const toggleTagStatus = (tagId) => {
    setTags((prevTags) =>
      prevTags.map((tag) => {
        const id = tag.tag_id || tag.id || tag._id;
        if (id !== tagId) return tag;
        const currentActive =
          tag.is_active !== undefined ? tag.is_active : tag.status !== "inactive";
        const updated = {
          ...tag,
          is_active: !currentActive,
          status: !currentActive ? "active" : "inactive",
        };
        showInfoToast(`Tag "${tag.tag_name || tag.name}" ${updated.is_active ? "enabled" : "disabled"}`);
        return updated;
      })
    );
  };

  // ===== Selection helpers =====
  const isRowSelected = (id) => !!selectedIds[id];
  const toggleRow = (id, checked) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (checked) next[id] = true; else delete next[id];
      return next;
    });
  };
  const toggleAllVisible = (checked) => {
    if (checked) {
      const next = {};
      filteredTags.forEach((t) => {
        const id = t.tag_id || t.id || t._id;
        next[id] = true;
      });
      setSelectedIds(next);
    } else {
      setSelectedIds({});
    }
  };

  // ===== Bulk actions =====
  const getSelectedList = () => filteredTags.filter((t) => {
    const id = t.tag_id || t.id || t._id;
    return !!selectedIds[id];
  });
  const bulkDelete = () => {
    const list = getSelectedList();
    if (list.length === 0) return;
    setPendingDelete({ mode: "bulk", ids: list.map((t) => t.tag_id || t.id || t._id), names: list.map((t)=> t.tag_name || t.name) });
    setShowDeleteDialog(true);
  };
  const bulkEnable = () => {
    const list = getSelectedList();
    if (list.length === 0) return;
    setTags((prev) => prev.map((t) => {
      const id = t.tag_id || t.id || t._id;
      if (!selectedIds[id]) return t;
      return { ...t, is_active: true, status: "active" };
    }));
    showSuccessToast(`${list.length} tag${list.length>1?"s":""} enabled`);
  };
  const bulkDisable = () => {
    const list = getSelectedList();
    if (list.length === 0) return;
    setTags((prev) => prev.map((t) => {
      const id = t.tag_id || t.id || t._id;
      if (!selectedIds[id]) return t;
      return { ...t, is_active: false, status: "inactive" };
    }));
    showSuccessToast(`${list.length} tag${list.length>1?"s":""} disabled`);
  };

  // ===== View / Edit / Delete modals =====
  const [viewTag, setViewTag] = useState(null);
  const [editTag, setEditTag] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // {mode:"single"|"bulk", id|ids, name|names}

  const openDeleteSingle = (id, name) => {
    setPendingDelete({ mode: "single", id, name });
    setShowDeleteDialog(true);
  };
  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.mode === "single") {
      const { id, name } = pendingDelete;
      setTags((prev) => prev.filter((t) => (t.tag_id || t.id || t._id) !== id));
      showSuccessToast(`Tag "${name}" deleted`);
      setSelectedIds((prev)=>{ const n={...prev}; delete n[id]; return n;});
    } else {
      const ids = new Set(pendingDelete.ids);
      setTags((prev) => prev.filter((t) => !ids.has(t.tag_id || t.id || t._id)));
      setSelectedIds({});
      showSuccessToast(`${pendingDelete.ids.length} tag${pendingDelete.ids.length>1?"s":""} deleted`);
    }
    setShowDeleteDialog(false);
    setPendingDelete(null);
  };
  const cancelDelete = () => { setShowDeleteDialog(false); setPendingDelete(null); };

  useEffect(() => {
    if (user?.customer_id) {
      fetchTags();
      fetchCategories();
    }
  }, [user?.customer_id]);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Backend API - Uncomment when backend is ready
      // const response = await axios.get(API_ENDPOINTS.TAGS.GET_ALL, {
      //   params: { customer_id: user.customer_id },
      //   withCredentials: true,
      // });

      // // Handle different response formats
      // if (response.data && response.data.success !== false) {
      //   // Success case - check for tags in response
      //   setTags(response.data.tags || response.data.data || []);
      // } else if (Array.isArray(response.data)) {
      //   // Direct array response
      //   setTags(response.data);
      // } else {
      //   // Empty or error response
      //   setTags([]);
      // }

      // MOCK DATA - Remove when backend is ready
      setTimeout(() => {
        setTags([
          // { tag_id: 1, tag_name: "VIP", tag_color: "#FF6B6B", usage_count: 5 },
          // { tag_id: 2, tag_name: "Regular", tag_color: "#4ECDC4", usage_count: 12 },
          // { tag_id: 3, tag_name: "New Customer", tag_color: "#45B7D1", usage_count: 3 },
        ]);
        setIsLoading(false);
      }, 500); // Simulate API delay
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      setTags([]); // Set empty array on error
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Categories feature may not be implemented yet, so we'll set empty array
      // If you need categories, add GET_CATEGORIES to API_ENDPOINTS.TAGS
      setCategories([]);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleDelete = async (tagId, tagName) => {
    if (!window.confirm(`Are you sure you want to delete tag "${tagName}"?`)) {
      return;
    }

    try {
      // TODO: Backend API - Uncomment when backend is ready
      // const response = await axios.delete(API_ENDPOINTS.TAGS.DELETE(tagId), {
      //   data: {
      //     customer_id: user.customer_id,
      //   },
      //   withCredentials: true,
      // });

      // if (response.data.success !== false) {
      //   setTags(tags.filter((tag) => {
      //     const id = tag.tag_id || tag.id || tag._id;
      //     return id !== tagId;
      //   }));
      //   alert("Tag deleted successfully");
      //   fetchTags(); // Refresh tags list
      // } else {
      //   alert(response.data.message || "Failed to delete tag");
      // }

      // MOCK DELETE - Remove when backend is ready
      setTags(tags.filter((tag) => {
        const id = tag.tag_id || tag.id || tag._id;
        return id !== tagId;
      }));
      showSuccessToast("Tag deleted successfully");
    } catch (error) {
      console.error("Failed to delete tag:", error);
      showErrorToast(error.response?.data?.message || "Failed to delete tag");
    }
  };

  const filteredTags = tags.filter((tag) => {
    const tagName = tag.tag_name || tag.name || "";
    const categoryName = tag.category_name || tag.category || "";
    const searchLower = searchTerm.toLowerCase();
    return tagName.toLowerCase().includes(searchLower) || 
           (categoryName && categoryName.toLowerCase().includes(searchLower));
  });

  return (
    <>
      <div className="flex-1 pt-2.5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold">Tags</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCreateModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
              type="button"
            >
              <img src={vendor} alt="plus sign" className="w-5 h-5" />
              <span>Create Tag</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tags Table */}
      {/* Bulk actions toolbar */}
      <div className="mb-2">
        {hasSelection && (
          <div className="flex items-center gap-2 bg-[#F4F4F4] border border-gray-300 rounded-md px-3 py-2 w-full lg:w-auto">
            <span className="text-sm font-medium text-gray-700">{Object.keys(selectedIds).length} selected</span>
            {/* <button onClick={bulkEnable} className="px-2 py-1 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700">Enable</button>
            <button onClick={bulkDisable} className="px-2 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700">Disable</button> */}
            <button onClick={bulkDelete} className="px-2 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px] bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
            <table className="w-full text-sm text-center">
              <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
                <tr>
                  <th className="px-2 py-4 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-center h-full">
                      <input
                        type="checkbox"
                        className="form-checkbox w-4 h-4"
                        checked={filteredTags.length>0 && filteredTags.every((t)=> selectedIds[t.tag_id||t.id||t._id])}
                        onChange={(e)=> toggleAllVisible(e.target.checked)}
                      />
                    </div>
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Tag Name
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Category
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    First Message
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Status
                  </th>
                  <th className="px-2 py-4 sm:px-6 sm:py-4 text-center text-[12px] sm:text-[16px] font-semibold font-sans text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                        <span className="text-gray-500">Loading tags...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTags.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <Tag className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600 font-medium">
                        {searchTerm ? "No tags found matching your search." : "No tags created yet."}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Create Your First Tag
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((tag) => {
                    const tagId = tag.tag_id || tag.id || tag._id;
                    const tagName = tag.tag_name || tag.name || "Untitled";
                    const tagColor = tag.tag_color || tag.color || "#0AA89E";
                    const categoryName = tag.category_name || tag.category || "Uncategorized";
                    const isActive = tag.is_active !== undefined ? tag.is_active : tag.status !== "inactive";
                    
                    return (
                      <tr
                        key={tagId}
                        className="border-t border-b border-b-[#C3C3C3] hover:bg-gray-50 text-md"
                      >
                        <td className="px-2 py-4 sm:px-6 sm:py-4">
                          <div className="flex items-center justify-center h-full">
                            <input
                              type="checkbox"
                              className="form-checkbox w-4 h-4"
                              checked={isRowSelected(tagId)}
                              onChange={(e)=> toggleRow(tagId, e.target.checked)}
                            />
                          </div>
                        </td>
                        <td className="px-2 py-4 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <span
                              className="inline-block px-3 py-1 rounded-full text-[12px] sm:text-[14px] font-medium"
                              style={{ 
                                backgroundColor: tagColor ? `${tagColor}40` : "#0AA89E40", 
                                color: tagColor || "#0AA89E" 
                              }}
                            >
                              {tagName}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-4 sm:px-6 sm:py-4 text-[12px] sm:text-[16px] text-gray-700 font-medium">
                          {categoryName}
                        </td>
                        <td className="px-2 py-4 sm:px-6 sm:py-4 text-[12px] sm:text-[16px] text-gray-700 font-medium">
                          {tag.first_message_enabled ? "Yes" : "-"}
                        </td>
                        <td className="px-2 py-4 sm:px-6 sm:py-4">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => toggleTagStatus(tagId)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                isActive ? "bg-teal-600" : "bg-gray-300"
                              }`}
                              title={isActive ? "Active" : "Inactive"}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  isActive ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="px-2 py-4 sm:px-6 sm:py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setViewTag(tag);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="View tag"
                            >
                              <Eye size={16} className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => {
                                setEditTag(tag);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Edit tag"
                            >
                              <Edit size={16} className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => openDeleteSingle(tagId, tagName)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="Delete tag"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Create Tag Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">Create New Tag</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                type="button"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <CreateTagForm
                onSuccess={(newTag) => {
                  // Add the new tag to the list immediately (for mock data)
                  if (newTag) {
                    setTags((prevTags) => [...prevTags, newTag]);
                  }
                  setShowCreateModal(false);
                  // fetchTags(); // Refresh tags list - Uncomment when backend is ready
                }}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Tag Modal - reuse CreateTagForm in read-only mode */}
      {viewTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={(e)=>{ if(e.target===e.currentTarget) setViewTag(null); }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CreateTagForm
              showHeader
              mode="view"
              readOnly
              initialTag={viewTag}
              onCancel={() => setViewTag(null)}
            />
          </div>
        </div>
      )}

      {/* Edit Tag Modal - reuse CreateTagForm in edit mode */}
      {editTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={(e)=>{ if(e.target===e.currentTarget) setEditTag(null); }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CreateTagForm
              showHeader
              mode="edit"
              initialTag={editTag}
              onCancel={() => setEditTag(null)}
              onSuccess={(updated)=>{
                setTags((prev)=> prev.map((t)=> ((t.tag_id||t.id||t._id)===(updated.tag_id||updated.id||updated._id))? {...t, ...updated}: t));
                setEditTag(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={(e)=>{ if(e.target===e.currentTarget) cancelDelete(); }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Confirm Delete</h3>
            </div>
            <div className="p-6 text-sm text-gray-700">
              {pendingDelete?.mode === "single" ? (
                <p>Are you sure you want to delete tag <span className="font-semibold">"{pendingDelete?.name}"</span>? This action cannot be undone.</p>
              ) : (
                <p>Are you sure you want to delete <span className="font-semibold">{pendingDelete?.ids?.length}</span> selected tag(s)? This action cannot be undone.</p>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200" type="button" onClick={cancelDelete}>Cancel</button>
              <button className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700" type="button" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TagsManagement;