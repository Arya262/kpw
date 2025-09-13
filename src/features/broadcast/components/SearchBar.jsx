import React from 'react';
import searchIcon from "../../../assets/search.png";

const SearchBar = ({ search, setSearch }) => {
  return (
    <div className="flex-shrink-0 ml-0 sm:ml-10 md:ml-16 lg:ml-28">
      <div className="relative w-full md:w-[280px] lg:w-[300px]">
        <img
          src={searchIcon}
          alt="Search"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-60"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search template by Name or Category..."
          className="pl-2 pr-8 py-2 border border-gray-300 text-sm rounded-md w-full focus:outline-none"
        />
      </div>
    </div>
  );
};

export default SearchBar;
