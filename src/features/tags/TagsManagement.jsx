import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Tag, Trash2, Search, X } from "lucide-react";
import DeleteConfirmationDialog from "../shared/DeleteConfirmationDialog";
import CreateTagForm from "./CreateTagForm";
import vendor from "../../assets/Vector.png";
import { useTagsApi } from "./hooks/useTagsApi";
import { useTagSelection } from "./hooks/useTagSelection";
import { getTagId, getTagName, getTagColor, filterTags, formatTagDate } from "./utils/tagUtils";

const TagsManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const {
    tags,
    setTags,
    isLoading,
    isDeleting,
    fetchTags,
    deleteTag,
    deleteTags,
  } = useTagsApi(user?.customer_id);

  const {
    hasSelection,
    selectedCount,
    isSelected,
    toggleSelection,
    toggleAllVisible,
    areAllSelected,
    getSelectedTags,
    clearSelection,
    removeFromSelection,
  } = useTagSelection();

  useEffect(() => {
    if (user?.customer_id) {
      fetchTags();
    }
  }, [user?.customer_id, fetchTags]);

  const filteredTags = filterTags(tags, searchTerm);

  // Delete handlers
  const openDeleteSingle = (id, name) => {
    setPendingDelete({ mode: "single", id, name });
    setShowDeleteDialog(true);
  };

  const openBulkDelete = () => {
    const selected = getSelectedTags(filteredTags);
    if (selected.length === 0) return;
    setPendingDelete({
      mode: "bulk",
      ids: selected.map(getTagId),
      names: selected.map(getTagName),
    });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    if (pendingDelete.mode === "single") {
      const result = await deleteTag(pendingDelete.id, pendingDelete.name);
      if (result.success) removeFromSelection(pendingDelete.id);
    } else {
      const result = await deleteTags(pendingDelete.ids);
      if (result.success) clearSelection();
    }

    setShowDeleteDialog(false);
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setPendingDelete(null);
  };

  return (
    <>
      <div className="flex-1 pt-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Tags</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
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
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
              type="button"
            >
              <img src={vendor} alt="plus sign" className="w-5 h-5" />
              <span>Create Tag</span>
            </button>
          </div>
        </div>
      </div>

      {hasSelection && (
        <div className="mb-2 flex items-center gap-2 bg-[#F4F4F4] border border-gray-300 rounded-md px-3 py-2">
          <span className="text-sm font-medium text-gray-700">{selectedCount} selected</span>
          <button onClick={openBulkDelete} className="px-2 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
            Delete
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[900px] bg-white rounded-2xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden">
          <table className="w-full text-sm text-center">
            <thead className="bg-[#F4F4F4] border-b-2 shadow-sm border-gray-300">
              <tr>
                <th className="px-2 py-4 sm:px-6">
                  <input
                    type="checkbox"
                    className="form-checkbox w-4 h-4"
                    checked={areAllSelected(filteredTags)}
                    onChange={(e) => toggleAllVisible(e.target.checked, filteredTags)}
                  />
                </th>
                <th className="px-2 py-4 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">Created Date</th>
                <th className="px-2 py-4 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">Tag Name</th>
                <th className="px-2 py-4 sm:px-6 text-[12px] sm:text-[16px] font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                      <span className="text-gray-500">Loading tags...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTags.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <Tag className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 font-medium">
                      {searchTerm ? "No tags found matching your search." : "No tags created yet."}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                      >
                        Create Your First Tag
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag) => {
                  const tagId = getTagId(tag);
                  const tagName = getTagName(tag);
                  const tagColor = getTagColor(tag);
                  const tagDate = formatTagDate(tag?.created_at || tag?.createdAt);

                  return (
                    <tr key={tagId} className="border-t border-b border-b-[#C3C3C3] hover:bg-gray-50">
                      <td className="px-2 py-4 sm:px-6">
                        <input
                          type="checkbox"
                          className="form-checkbox w-4 h-4"
                          checked={isSelected(tagId)}
                          onChange={(e) => toggleSelection(tagId, e.target.checked)}
                        />
                      </td>
                      <td className="px-2 py-4 sm:px-6 text-[12px] sm:text-[14px] text-gray-600 whitespace-nowrap">
                        {tagDate || "-"}
                      </td>
                      <td className="px-2 py-4 sm:px-6 whitespace-nowrap">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-[12px] sm:text-[14px] font-medium"
                          style={{ backgroundColor: `${tagColor}40`, color: tagColor }}
                        >
                          {tagName}
                        </span>
                      </td>
                      <td className="px-2 py-4 sm:px-6">
                        <button onClick={() => openDeleteSingle(tagId, tagName)} className="p-1.5 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
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
        <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-[9999] p-4" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">Create New Tag</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded hover:bg-gray-100 text-gray-500" type="button">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <CreateTagForm
                onSuccess={(newTag) => {
                  if (newTag) setTags((prev) => [...prev, newTag]);
                  setShowCreateModal(false);
                }}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        showDialog={showDeleteDialog}
        title="Delete Tag"
        message={
          pendingDelete?.mode === "single"
            ? `Are you sure you want to delete tag "${pendingDelete?.name}"? This action cannot be undone.`
            : `Are you sure you want to delete ${pendingDelete?.ids?.length} selected tag(s)? This action cannot be undone.`
        }
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default TagsManagement;