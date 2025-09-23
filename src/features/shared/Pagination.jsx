import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange = () => {},
  onItemsPerPageChange = () => {},
}) {
  const [activePage, setActivePage] = useState(currentPage || 1);
  const [windowStart, setWindowStart] = useState(1);
  const windowSize = 3;

  // Sync with prop changes
  useEffect(() => {
    setActivePage(currentPage || 1);

    //  adjust window if currentPage goes outside of visible range
    if (currentPage < windowStart) {
      setWindowStart(currentPage);
    } else if (currentPage > windowStart + windowSize - 1) {
      setWindowStart(currentPage - windowSize + 1);
    }
  }, [currentPage]);

  // scroll window left/right (NOT selecting directly)
  const handlePrevArrow = () => {
    setWindowStart((prev) => Math.max(prev - 1, 1));
  };

  const handleNextArrow = () => {
    setWindowStart((prev) =>
      Math.min(prev + 1, totalPages - windowSize + 1)
    );
  };

  // Handle page change
  const handlePageClick = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setActivePage(newPage);
    onPageChange(newPage);

    // 🔥 Auto-adjust window so activePage stays visible
    if (newPage < windowStart) {
      setWindowStart(newPage);
    } else if (newPage > windowStart + windowSize - 1) {
      setWindowStart(newPage - windowSize + 1);
    }
  };

  const handlePrevPage = () => handlePageClick(activePage - 1);
  const handleNextPage = () => handlePageClick(activePage + 1);

  const safeTotal = typeof totalItems === "number" ? totalItems : 0;
  const safeLimit = typeof itemsPerPage === "number" ? itemsPerPage : 10;
  const safeTotalPages = typeof totalPages === "number" ? totalPages : 1;

  const getPageNumbers = () => {
    let start = windowStart;
    let end = Math.min(start + windowSize - 1, totalPages);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full mt-4">
      {/* Desktop / Large screens */}
      <div className="hidden md:flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <div className="relative">
            <select
              value={safeLimit}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={totalItems}>All</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevPage}
            disabled={activePage === 1}
            className={`p-1.5 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              activePage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
            }`}
          >
            Prev
          </button>

          <button
            onClick={handlePrevArrow}
            disabled={windowStart === 1}
            className={`p-1.5 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              windowStart === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all duration-300 ease-in-out transform hover:scale-105  ${
                activePage === pageNum
                  ? "bg-teal-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={handleNextArrow}
            disabled={windowStart + windowSize - 1 >= totalPages}
            className={`p-1.5 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              windowStart + windowSize - 1 >= totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={handleNextPage}
            disabled={activePage === safeTotalPages}
            className={`p-1.5 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              activePage === safeTotalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
            }`}
          >
            Next
          </button>
        </div>

        {/* Results info */}
        <div className="text-sm text-gray-600">
          Showing &nbsp;
          <span className="font-medium">
            {safeTotal > 0 ? (activePage - 1) * safeLimit + 1 : 0}
            {safeTotal > 0 && (
              <>-{Math.min(activePage * safeLimit, safeTotal)}&nbsp;</>
            )}
          </span>
          of <span className="font-medium">{safeTotal}</span>&nbsp; results
        </div>
      </div>

      {/* Mobile / Tablet */}
      <div className="flex md:hidden items-center bg-white border border-gray-200 rounded-lg p-3 overflow-x-auto whitespace-nowrap gap-3">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <select
            value={safeLimit}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-white border border-gray-300 rounded-md text-sm py-1 px-2"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={totalItems}>All</option>
          </select>
        </div>

        {/* Results + arrows */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>
            {Math.min((activePage - 1) * safeLimit + 1, safeTotal)}–
            {Math.min(activePage * safeLimit, safeTotal)} of {safeTotal}
          </span>
          <div className="flex items-center">
            <button
              onClick={handlePrevPage}
              disabled={activePage === 1}
              className={`p-1 ${
                activePage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={activePage === safeTotalPages}
              className={`p-1 ${
                activePage === safeTotalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
