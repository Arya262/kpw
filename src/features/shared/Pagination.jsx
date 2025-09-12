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

  // Sync with prop changes
  useEffect(() => {
    setActivePage(currentPage || 1);
  }, [currentPage]);

  // Handle page change
  const handlePageClick = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setActivePage(newPage);
    onPageChange(newPage);
  };

  const handlePrevPage = () => handlePageClick(activePage - 1);
  const handleNextPage = () => handlePageClick(activePage + 1);

  const safeTotal = typeof totalItems === "number" ? totalItems : 0;
  const safeLimit = typeof itemsPerPage === "number" ? itemsPerPage : 10;
  const safeTotalPages = typeof totalPages === "number" ? totalPages : 1;

  // Calculate page numbers to display (max 5 pages)
  const getPageNumbers = () => {
    let startPage = Math.max(activePage - 2, 1);
    let endPage = Math.min(startPage + 4, safeTotalPages);

    // Adjust start if we're at the end
    if (endPage - startPage < 4) {
      startPage = Math.max(endPage - 4, 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
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
              {[5, 10, 25, 50].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageClick(1)}
            disabled={activePage === 1}
            className={`p-1.5 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              activePage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
            }`}
          >
            First
          </button>

          <button
            onClick={handlePrevPage}
            disabled={activePage === 1}
            className={`p-1.5 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              activePage === 1
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
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all duration-300 ease-in-out transform hover:scale-105 ${
                activePage === pageNum
                  ? "bg-teal-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={handleNextPage}
            disabled={activePage === safeTotalPages}
            className={`p-1.5 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              activePage === safeTotalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => handlePageClick(safeTotalPages)}
            disabled={activePage === safeTotalPages}
            className={`p-1.5 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              activePage === safeTotalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
            }`}
          >
            Last
          </button>
        </div>

        {/* Results info */}
        <div className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {Math.min((activePage - 1) * safeLimit + 1, safeTotal)}
          </span>{" "}
          -{" "}
          <span className="font-medium">
            {Math.min(activePage * safeLimit, safeTotal)}
          </span>{" "}
          of <span className="font-medium">{safeTotal}</span> results
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
            {[5, 10, 25, 50].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
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
