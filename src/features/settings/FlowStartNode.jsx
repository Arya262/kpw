import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { ToggleRight, ToggleLeft, MessageCircle, Play } from "lucide-react";

const FlowStartNode = ({ data }) => {
const [triggered, setTriggered] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      // Message matching logic here for demo purposes
      if (message.toLowerCase().includes('hi') && message.toLowerCase().includes('food')) {
        setTriggered(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-4 w-[300px] relative overflow-visible">
      {/* Top Handle */}
      <Handle
        type="source"
        position={Position.Top}
        // id={`btn-${button.id}`}
        // isConnectable={isConnectable}
        style={{
          background: "white",
          border: "2px solid rgb(7, 141, 238)",
          width: 12,
          height: 12,
          borderRadius: "50%",
          position: "absolute",
          left: 280,
          top: "5%",
          transform: "translateY(-50%)",
        }}
      />

      <h3 className="text-sm font-semibold text-blue-800 mb-3">Flow Start</h3>

      {/* Keyword Input */}
      <div className="bg-white border rounded-md px-3 py-2 mb-3">
        <label className="text-xs font-medium text-gray-600 mb-1 block">
          Enter Keywords
        </label>
        <div className="flex flex-wrap gap-1 mb-1">
          {Array.isArray(data.keywords) &&
            data.keywords.map((word, i) => {
              // Ensure word is a string before rendering
              const keyword = String(word || "").trim();
              if (!keyword) return null;

              return (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  {keyword}
                  <button
                    type="button"
                    aria-label="Remove keyword"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => data.onRemoveKeyword?.(i)}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          <input
            type="text"
            className="outline-none text-sm w-full placeholder:text-gray-400"
            placeholder="+ Enter Keyword"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                e.preventDefault();
                data.onAddKeyword?.(e.target.value.trim());
                e.target.value = "";
              }
            }}
          />
        </div>
        <p className="text-[11px] text-gray-400">
          Type and press enter to add a keyword.
        </p>
      </div>

      {/* Regex Input */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">
            Enter regex to match substring trigger
          </label>
          <button
            type="button"
            aria-label="Toggle case sensitivity"
            onClick={data.onToggleCaseSensitive}
          >
            {data.caseSensitive ? (
              <ToggleRight className="text-blue-500" size={18} />
            ) : (
              <ToggleLeft className="text-gray-400" size={18} />
            )}
          </button>
        </div>
        <input
          type="text"
          placeholder="Enter Regex"
          className="w-full text-sm px-2 py-1 border rounded-md focus:ring-1 focus:ring-blue-300"
          value={data.regex || ""}
          onChange={(e) => data.onChangeRegex?.(e.target.value)}
        />
        <p className="text-[11px] text-gray-400 mt-1">
          Case {data.caseSensitive ? "sensitive" : "insensitive"} regex
        </p>
      </div>

      {/* Template Selection */}
      {!data.template ? (
        <button
          type="button"
          className="w-full text-blue-600 border border-blue-400 rounded-md py-1 text-sm font-medium hover:bg-blue-100 transition mb-2"
          onClick={data.onChooseTemplate}
        >
          Choose Template
        </button>
      ) : (
        <div className="w-full bg-green-50 border border-green-300 text-green-800 text-sm rounded-md px-3 py-2 mb-2 text-center">
          ✅ Template Selected: <strong>{data.template.name}</strong>
        </div>
      )}

      {/* Message Matching Section */}
      <div className="bg-white border rounded-md px-3 py-2 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-blue-600" />
          <label className="text-xs font-medium text-gray-600">Message Trigger Test</label>
          {triggered && (
            <div className="ml-auto flex items-center gap-1">
              <Play className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Triggered!</span>
            </div>
          )}
        </div>
        <input
          type="text"
          placeholder="Test: hi I want food"
          className="w-full text-sm px-2 py-1 border rounded-md focus:ring-1 focus:ring-blue-300 mb-1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              const testMessage = e.target.value.trim();
              const matchesKeywords = data.keywords && data.keywords.length > 0 
                ? data.keywords.every(keyword => 
                    data.caseSensitive 
                      ? testMessage.includes(keyword)
                      : testMessage.toLowerCase().includes(keyword.toLowerCase())
                  )
                : false;
              
              const matchesRegex = data.regex 
                ? new RegExp(data.regex, data.caseSensitive ? 'g' : 'gi').test(testMessage)
                : false;
              
              if (matchesKeywords || matchesRegex) {
                setTriggered(true);
                if (data.onFlowTriggered) {
                  data.onFlowTriggered({
                    message: testMessage,
                    timestamp: new Date().toISOString(),
                    matchType: matchesKeywords ? 'keywords' : 'regex'
                  });
                }
                setTimeout(() => setTriggered(false), 3000);
              }
            }
          }}
        />
        <p className="text-[11px] text-gray-400">
          Enter a message to test flow trigger. Must contain ALL keywords as substrings.
        </p>
      </div>

      {/* Trigger Status */}
      <div className={`p-2 rounded-md mb-2 text-center text-xs ${
        triggered 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}>
        {triggered ? (
          <div className="flex items-center justify-center gap-1">
            <Play className="w-3 h-3" />
            Flow Started! Building response...
          </div>
        ) : (
          'Waiting for trigger message...'
        )}
      </div>

      <p className="text-[11px] text-gray-400 text-center">
        Add keywords/regex and connect to templates to build flow.
      </p>
    </div>
  );
};

export default FlowStartNode;
