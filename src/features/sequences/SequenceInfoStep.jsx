import React from "react";

const SequenceInfoStep = ({ seqData, setSeqData }) => (
  <div className="space-y-6">
    <div className="text-center mb-2">
      <h4 className="text-lg font-semibold text-gray-900">
        Sequence Information
      </h4>
      <p className="text-sm text-gray-600 mt-1">
        Basic details about your drip sequence
      </p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sequence Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none  focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors placeholder-gray-400"
          placeholder="Enter a descriptive sequence name"
          value={seqData.sequence_name}
          onChange={(e) =>
            setSeqData({ ...seqData, sequence_name: e.target.value })
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          This will help you identify the sequence later
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sequence Description 
        </label>
        <input
          type="text"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors placeholder-gray-400"
          placeholder="Enter a Description"
          value={seqData.sequence_description}
          onChange={(e) =>
            setSeqData({ ...seqData, sequence_description: e.target.value })
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          This will help you Describe the sequence later
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sequence Based On <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
          value={seqData.target_type}
          onChange={(e) =>
            setSeqData({ ...seqData, target_type: e.target.value })
          }
        >
          <option value="">Select a trigger type</option>
          <option value="tag1">Tag Addition - Tag1</option>
          <option value="tag2">Tag Addition - Tag2</option>
          <option value="tag3">Tag Addition - Tag3</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Choose what will trigger this sequence
        </p>
      </div>
    </div>
  </div>
);

export default SequenceInfoStep;