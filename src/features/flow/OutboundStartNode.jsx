import { Handle, Position } from "reactflow";
import { Send, Clock } from "lucide-react";

const OutboundStartNode = ({ data }) => {
  return (
    <div 
      className="bg-white border-2 border-purple-400 rounded-xl shadow-md p-4 w-[350px] relative overflow-visible hover:shadow-lg transition-all"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
      }}
    >
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: 'white',
          border: '2px solid #a855f7',
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
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-200">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-sm">
          <Send className="text-white" size={14} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-800">Outbound Flow Start</h3>
          <p className="text-xs text-gray-500">Automated sequence</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Info Box */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-3">
          <div className="flex items-start gap-2">
            <Clock className="text-purple-600 mt-0.5" size={16} />
            <div>
              <p className="text-xs font-semibold text-purple-800 mb-1">
                Outbound Flow
              </p>
              <p className="text-xs text-purple-600">
                This flow will be triggered manually or by automation. Connect nodes below to build your message sequence.
              </p>
            </div>
          </div>
        </div>

        {/* Trigger Options */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            Trigger Type
          </label>
          <select
            className="nodrag w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
            value={data.triggerType || "manual"}
            onChange={(e) => data.onChangeTriggerType?.(e.target.value)}
          >
            <option value="manual">Manual Trigger</option>
            <option value="scheduled">Scheduled</option>
            <option value="event">Event-Based</option>
          </select>
          <p className="text-[10px] text-gray-400 mt-1.5">
            How this flow will be initiated
          </p>
        </div>

        {/* Delay Before Start */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            Initial Delay (seconds)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            className="nodrag w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
            value={data.initialDelay || ""}
            onChange={(e) => data.onChangeInitialDelay?.(e.target.value)}
          />
          <p className="text-[10px] text-gray-400 mt-1.5">
            Wait time before starting the sequence
          </p>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-3 pt-3 border-t border-gray-200">
        Connect nodes to build your outbound message sequence
      </p>
    </div>
  );
};

export default OutboundStartNode;
