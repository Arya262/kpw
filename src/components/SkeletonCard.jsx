import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-100">
      {/* Image placeholder */}
      <div className="w-full h-44 bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:1000px_100%]" />
      </div>

      {/* Content placeholder */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <div className="h-4 w-32 bg-gray-200 relative overflow-hidden rounded mb-2">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:1000px_100%]" />
            </div>
            <div className="h-3 w-20 bg-gray-200 relative overflow-hidden rounded">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:1000px_100%]" />
            </div>
          </div>
          <div className="w-6 h-6 bg-gray-200 relative overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:1000px_100%]" />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="h-3 w-full bg-gray-200 relative overflow-hidden rounded">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:1000px_100%]" />
          </div>
          <div className="h-3 w-5/6 bg-gray-200 relative overflow-hidden rounded">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:1000px_100%]" />
          </div>
        </div>
      </div>

      {/* Button placeholder */}
      <div className="h-10 bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:1000px_100%]" />
      </div>
    </div>
  );
};

export default SkeletonCard;
