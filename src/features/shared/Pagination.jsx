import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Dropdown from '../../components/Dropdown';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemsPerPageOptions = [5, 10, 25],
  onPageChange,
  onItemsPerPageChange,
  className = ''
}) => {
  // Calculate the range of items being shown
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show (max 5 at a time)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show ellipsis and current page in the middle
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className={`relative flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 py-3 bg-white rounded-b-lg ${className}`}>
      {/* Items per page selector */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Show</span>
        <div className="relative w-24">
          <Dropdown
            value={itemsPerPage}
            onChange={(value) => onItemsPerPageChange(Number(value))}
            options={itemsPerPageOptions.map(option => ({
              value: option,
              label: String(option),
              color: 'text-gray-700'
            }))}
            placeholder={String(itemsPerPage)}
          />
        </div>
        <span className="text-gray-600 whitespace-nowrap">per page</span>
      </div>
      
      {/* Items count info */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{startItem}-{endItem}</span> of <span className="font-medium">{totalItems}</span>
      </div>
      
      {/* Page navigation */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0AA89E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          Previous
        </button>
        
        {/* Page numbers */}
        <div className="hidden sm:flex items-center space-x-1">
          {getPageNumbers().map((pageNum, index, array) => (
            <React.Fragment key={pageNum}>
              {/* Show ellipsis if there's a gap */}
              {index > 0 && array[index - 1] !== pageNum - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              
              <button
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md transition-colors ${
                  currentPage === pageNum 
                    ? 'bg-[#0AA89E] text-white' 
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            </React.Fragment>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0AA89E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  itemsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  onPageChange: PropTypes.func.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default Pagination;
