import React from "react";

const LoadingSkeleton = ({ 
  rows = 3, 
  showHeader = true,
  className = ""
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-28"></div>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header Skeleton */}
        <div className="bg-gray-100 border-b-2 border-gray-200">
          <div className="flex">
            <div className="flex-1 px-6 py-3">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="flex-1 px-6 py-3">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
            <div className="flex-1 px-6 py-3">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex-1 px-6 py-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>

        {/* Table Rows Skeleton */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="border-b border-gray-200">
            <div className="flex items-center">
              {/* User column */}
              <div className="flex-1 px-6 py-4">
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              
              {/* Role column */}
              <div className="flex-1 px-6 py-4">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              
              {/* Permissions column */}
              <div className="flex-1 px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-14"></div>
                </div>
              </div>
              
              {/* Actions column */}
              <div className="flex-1 px-6 py-4">
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Skeleton for form inputs
export const FormSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
      
      {/* Permissions section skeleton */}
      <div className="mt-6">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Buttons skeleton */}
      <div className="flex justify-end gap-2 mt-6">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
