const TypingIndicator = () => (
    <div className="flex items-center gap-2">
      <div className="w-16 h-8 bg-[#f0f0f0] rounded-2xl flex items-center justify-center">
        <div className="flex gap-1 animate-pulse">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
  
  export default TypingIndicator;
  