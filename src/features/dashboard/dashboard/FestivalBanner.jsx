import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import useNextFestival from "../../hooks/useNextFestival";

const festivalImageMap = [
  { keywords: ["ganesh", "vinayaka"], image: "https://cdn.pixabay.com/photo/2021/09/07/08/22/lord-ganesha-6605707_1280.png" },
  { keywords: ["diwali", "deepavali"], image: "https://cdn.pixabay.com/photo/2021/10/21/12/48/diwali-6730888_1280.jpg" },
  { keywords: ["holi"], image: "https://cdn.pixabay.com/photo/2020/03/09/08/21/holi-4915330_1280.jpg" },
  { keywords: ["christmas"], image: "https://cdn.pixabay.com/photo/2016/12/20/10/16/christmas-1911637_1280.jpg" },
  { keywords: ["eid", "ramzan", "ramadan"], image: "https://cdn.pixabay.com/photo/2018/06/11/15/11/eid-3463794_1280.jpg" },
];

const getFestivalImage = (festivalName) => {
  const lowerName = festivalName.toLowerCase();
  for (const { keywords, image } of festivalImageMap) {
    if (keywords.some((kw) => lowerName.includes(kw))) {
      return image;
    }
  }
  return "https://cdn.pixabay.com/photo/2017/01/19/19/53/ganesh-1990465_1280.jpg"; 
};

const FestivalBanner = ({ onClick, ctaText = "Send a Campaign Today!" }) => {
  const { festival, loading } = useNextFestival();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!festival) return;
    const today = new Date().toISOString().split("T")[0]; 
    const closedDate = localStorage.getItem(`festivalBannerClosed_${festival.name}`);
    if (closedDate === today) {
      setHidden(true);
    }
  }, [festival]);

  const handleClose = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`festivalBannerClosed_${festival.name}`, today);
    setHidden(true);
  };

  if (hidden) return null;

  if (loading) {
    return (
      <div className="animate-pulse p-6 rounded-lg bg-gray-100">
        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-48"></div>
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No upcoming festivals 🎉</p>
      </div>
    );
  }

  const festivalDate = new Date(festival.date);
  const imageUrl = festival.image || getFestivalImage(festival.name);

  return (
    <div
      className="rounded-lg p-6 flex flex-col sm:flex-row justify-between items-center relative overflow-hidden"
      style={{
        background: "linear-gradient(to right, #FBD1D7 50%, #F9E1D6 100%)",
      }}
    >
      {/* Always show Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
        aria-label="Close banner"
      >
        <X size={20} />
      </button>

      {/* Left Content */}
      <div className="flex-1 flex flex-col justify-center gap-3 text-left max-w-lg">
        <p className="text-sm text-red-800 font-medium">
          {festivalDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
          })}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-red-900 leading-snug">
          {festival.name}
        </h2>
        {festival.description && (
          <p className="text-red-900 opacity-90 text-base">
            {festival.description}
          </p>
        )}
        <button
          onClick={onClick}
          className="mt-4 bg-white text-red-800 font-semibold px-4 py-2 rounded-md shadow hover:shadow-md transition w-fit"
        >
          {ctaText}
        </button>
      </div>

      {/* Right Image */}
      <div className="flex-shrink-0 mt-6 sm:mt-0 sm:ml-6">
        <img
          src={imageUrl}
          alt={festival.name}
          className="h-40 sm:h-48 object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default FestivalBanner;
