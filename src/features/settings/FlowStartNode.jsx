import { Handle, Position } from "reactflow";
import { ToggleRight, ToggleLeft, Play, X } from "lucide-react";

const FlowStartNode = ({ data }) => {
  return (
    <div 
      className="bg-white border-2 border-blue-400 rounded-xl shadow-md p-4 w-[350px] relative overflow-visible hover:shadow-lg transition-all"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      }}
    >
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: 'white',
          border: '2px solid #3b82f6',
          width: 12,
          height: 12,
          borderRadius: '50%',
          right: -7,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair',
        }}
        className="hover:scale-125 transition-transform"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-200">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
          <Play className="text-white" size={14} fill="white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-800">Flow Start</h3>
          <p className="text-xs text-gray-500">Configure flow triggers</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Keyword Input */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            Enter Keywords
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
            {Array.isArray(data.keywords) &&
              data.keywords.map((word, i) => {
                const keyword = String(word || "").trim();
                if (!keyword) return null;

                return (
                  <span
                    key={i}
                    className="bg-blue-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-blue-600 transition-colors"
                  >
                    {keyword}
                    <button
                      type="button"
                      aria-label="Remove keyword"
                      className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                      onClick={() => data.onRemoveKeyword?.(i)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
          </div>
          <input
            type="text"
            className="w-full outline-none text-sm bg-transparent placeholder:text-gray-400 border-t border-gray-200 pt-2"
            placeholder="Type keyword and press Enter..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                e.preventDefault();
                data.onAddKeyword?.(e.target.value.trim());
                e.target.value = "";
              }
            }}
          />
          <p className="text-[10px] text-gray-400 mt-1">
            Press Enter to add keywords that trigger this flow
          </p>
        </div>

        {/* Regex Input */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-700">
              Regex Pattern
            </label>
            <button
              type="button"
              aria-label="Toggle case sensitivity"
              onClick={data.onToggleCaseSensitive}
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:bg-white rounded px-1.5 py-0.5"
            >
              {data.caseSensitive ? (
                <>
                  <ToggleRight className="text-blue-500" size={18} />
                  <span className="text-blue-600">Aa</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="text-gray-400" size={18} />
                  <span className="text-gray-500">Aa</span>
                </>
              )}
            </button>
          </div>
          <input
            type="text"
            placeholder="e.g., ^hello|hi$"
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            value={data.regex || ""}
            onChange={(e) => data.onChangeRegex?.(e.target.value)}
          />
          <p className="text-[10px] text-gray-400 mt-1.5">
            {data.caseSensitive ? "Case sensitive" : "Case insensitive"} pattern matching
          </p>
        </div>

        {/* Template Selection */}
        {!data.template ? (
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
              text-blue-600 bg-blue-50 border-2 border-blue-200 border-dashed
              rounded-lg hover:bg-blue-100 hover:border-blue-300 
              transition-all text-sm font-medium"
            onClick={data.onChooseTemplate}
          >
            + Choose Template
          </button>
        ) : (
          <div className="w-full bg-green-50 border-2 border-green-300 text-green-800 text-sm rounded-lg px-3 py-2.5 flex items-center gap-2">
            <span className="text-lg">✓</span>
            <div className="flex-1 text-left">
              <div className="text-[10px] text-green-600 font-medium">Template Selected</div>
              <div className="font-semibold truncate">{data.template.name}</div>
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-3 pt-3 border-t border-gray-200">
        Configure triggers and connect nodes to build your flow
      </p>
    </div>
  );
};

export default FlowStartNode;
