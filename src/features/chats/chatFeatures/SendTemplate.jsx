import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { debounce } from "lodash";
import { API_ENDPOINTS } from "../../../config/api";
import axios from "axios";
import { X, Search, FileText, Loader2 } from "lucide-react";
import TemplatePreviewModal from "./TemplatePreviewModal";

const SendTemplate = ({ onSelect, onClose, returnFullTemplate = false }) => {
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
    pageSize: 10,
  });

  const { user } = useAuth();
  const isFetchingRef = useRef(false);
  const paginationRef = useRef(pagination);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const fetchTemplates = async (page = 1, search = "") => {
    if (!user?.customer_id) {
      setError("User authentication required.");
      setLoading(false);
      return;
    }

    const isNewSearch = page === 1;
    if (isNewSearch) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const response = await axios.get(API_ENDPOINTS.TEMPLATES.GET_ALL, {
        params: {
          customer_id: user.customer_id,
          page,
          search,
          status: "approved",
          limit: pagination.pageSize,
        },
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      let { templates: fetchedTemplates, pagination: paginationData } = response.data;
      fetchedTemplates = Array.isArray(fetchedTemplates)
        ? fetchedTemplates.filter((t) => t.status?.toUpperCase() === "APPROVED")
        : [];

      const { page: currentPage = 1, totalPages = 1, limit = pagination.pageSize } = paginationData || {};
      const hasMore = currentPage < totalPages;

      if (Array.isArray(fetchedTemplates)) {
        if (isNewSearch) {
          setFilteredTemplates(fetchedTemplates);
        } else {
          setFilteredTemplates((prev) => [...prev, ...fetchedTemplates]);
        }
        setPagination({ currentPage, totalPages, hasMore, pageSize: limit });
      }
    } catch (err) {
      console.error("Template fetch error:", err);
      setError(`Failed to load templates: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    const { currentPage, hasMore } = paginationRef.current;
    if (hasMore && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setLoadingMore(true);
      fetchTemplates(currentPage + 1, searchTerm).finally(() => {
        isFetchingRef.current = false;
        setLoadingMore(false);
      });
    }
  }, [searchTerm]);

  useEffect(() => {
    if (user?.customer_id) fetchTemplates(1, "");
  }, [user?.customer_id]);

  const debouncedSearch = useCallback(
    debounce((term) => fetchTemplates(1, term), 500),
    [user?.customer_id, pagination.pageSize]
  );

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      debouncedSearch(searchTerm);
    } else {
      fetchTemplates(1, "");
    }
    return () => debouncedSearch.cancel();
  }, [searchTerm]);

  const handleTemplateClick = (template) => {
    setPreviewTemplate(template);
  };

  const handleTemplateSelect = (templateData) => {
    onSelect(templateData);
    setPreviewTemplate(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(Number(timestamp)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#0AA89E] to-[#099086] flex-shrink-0 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-white">Choose a Template</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors" aria-label="Close">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates by name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0AA89E] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </p>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-[#0AA89E] animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading templates...</p>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileText className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">No templates found</p>
                <p className="text-sm">Try adjusting your search</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {filteredTemplates.map((template, index) => (
                    <div
                      key={index}
                      onClick={() => handleTemplateClick(template)}
                      className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-[#0AA89E] hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#0AA89E]/10 text-[#0AA89E]">
                          {template.template_type || "TEXT"}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(template.created_on)}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0AA89E] transition-colors">
                        {template.element_name || "Unnamed Template"}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {template.container_meta?.data || "No content"}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">{template.category || "General"}</span>
                        <button className="text-[#0AA89E] text-sm font-medium group-hover:underline">
                          Use Template →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {pagination.hasMore && (
                  <div className="flex justify-center py-6 border-t border-gray-200 bg-white">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-[#0AA89E] text-white rounded-xl hover:bg-[#099086] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More Templates"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={handleTemplateSelect}
          returnFullTemplate={returnFullTemplate}
          user={user}
        />
      )}
    </>
  );
};

export default SendTemplate;
