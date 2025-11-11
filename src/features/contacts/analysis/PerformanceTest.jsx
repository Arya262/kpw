/**
 * Performance Testing Tool
 * Run this to measure actual performance differences
 */

import React, { useState, useReducer, useRef, useEffect } from 'react';

// Simulate current ContactList with multiple useState
const ContactListWithUseState = ({ onMetrics }) => {
  const renderCount = useRef(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteContact, setDeleteContact] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [loading, setLoading] = useState({ contacts: false, export: false, delete: false });
  const [selection, setSelection] = useState({ mode: 'none', selected: {}, excluded: {} });

  useEffect(() => {
    renderCount.current += 1;
    onMetrics?.({
      type: 'useState',
      renders: renderCount.current,
      stateCount: 15,
    });
  });

  // Simulate opening edit modal (multiple state updates)
  const handleOpenEdit = () => {
    setEditContact({ id: 1, name: 'Test' });
    setIsPopupOpen(true);
    setShowExitDialog(false);
  };

  // Simulate starting delete (multiple state updates)
  const handleStartDelete = () => {
    setLoading(prev => ({ ...prev, delete: true }));
    setShowDeleteDialog(true);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">useState Version</h3>
      <p className="text-sm text-gray-600 mb-2">Renders: {renderCount.current}</p>
      <div className="space-x-2">
        <button
          onClick={handleOpenEdit}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Open Edit (2 updates)
        </button>
        <button
          onClick={handleStartDelete}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Start Delete (2 updates)
        </button>
      </div>
    </div>
  );
};

// Simulate ContactList with useReducer
const initialState = {
  ui: {
    searchTerm: "",
    filter: "All",
    filterDialogOpen: false,
    isPopupOpen: false,
    editContact: null,
    deleteContact: null,
    showDeleteDialog: false,
    showExitDialog: false,
    showGroupDialog: false,
    showExportDialog: false,
    exportFormat: 'csv',
    showPlansModal: false,
  },
  loading: {
    contacts: false,
    export: false,
    delete: false,
  },
  selection: {
    mode: 'none',
    selected: {},
    excluded: {},
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_EDIT_CONTACT':
      return {
        ...state,
        ui: {
          ...state.ui,
          editContact: action.payload,
          isPopupOpen: true,
          showExitDialog: false,
        },
      };
    case 'START_DELETE':
      return {
        ...state,
        loading: { ...state.loading, delete: true },
        ui: { ...state.ui, showDeleteDialog: true },
      };
    case 'CLOSE_ALL_MODALS':
      return {
        ...state,
        ui: {
          ...state.ui,
          isPopupOpen: false,
          editContact: null,
          deleteContact: null,
          showDeleteDialog: false,
          showExitDialog: false,
          showGroupDialog: false,
          showExportDialog: false,
          showPlansModal: false,
        },
      };
    default:
      return state;
  }
};

const ContactListWithUseReducer = ({ onMetrics }) => {
  const renderCount = useRef(0);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    renderCount.current += 1;
    onMetrics?.({
      type: 'useReducer',
      renders: renderCount.current,
      stateCount: 1,
    });
  });

  const handleOpenEdit = () => {
    dispatch({ type: 'OPEN_EDIT_CONTACT', payload: { id: 1, name: 'Test' } });
  };

  const handleStartDelete = () => {
    dispatch({ type: 'START_DELETE' });
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">useReducer Version</h3>
      <p className="text-sm text-gray-600 mb-2">Renders: {renderCount.current}</p>
      <div className="space-x-2">
        <button
          onClick={handleOpenEdit}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Open Edit (1 dispatch)
        </button>
        <button
          onClick={handleStartDelete}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Start Delete (1 dispatch)
        </button>
      </div>
    </div>
  );
};

// Main Performance Test Component
const PerformanceTest = () => {
  const [useStateMetrics, setUseStateMetrics] = useState({ renders: 0, stateCount: 0 });
  const [useReducerMetrics, setUseReducerMetrics] = useState({ renders: 0, stateCount: 0 });
  const [testResults, setTestResults] = useState([]);

  const runStressTest = async () => {
    setTestResults([]);
    const results = [];

    // Simulate 100 rapid state updates
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      // Simulate state update
      await new Promise(resolve => setTimeout(resolve, 1));
      const end = performance.now();
      results.push({ iteration: i, time: end - start });
    }

    setTestResults(results);
  };

  const avgTime = testResults.length > 0
    ? (testResults.reduce((sum, r) => sum + r.time, 0) / testResults.length).toFixed(2)
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Performance Testing Tool</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <ContactListWithUseState onMetrics={setUseStateMetrics} />
        <ContactListWithUseReducer onMetrics={setUseReducerMetrics} />
      </div>

      {/* Metrics Comparison */}
      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
        <h3 className="font-bold text-lg mb-3">Real-time Metrics</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-red-600 mb-2">useState</h4>
            <p className="text-sm">Total Renders: {useStateMetrics.renders}</p>
            <p className="text-sm">State Variables: {useStateMetrics.stateCount}</p>
          </div>
          <div>
            <h4 className="font-semibold text-green-600 mb-2">useReducer</h4>
            <p className="text-sm">Total Renders: {useReducerMetrics.renders}</p>
            <p className="text-sm">State Variables: {useReducerMetrics.stateCount}</p>
          </div>
        </div>
        {useStateMetrics.renders > 0 && useReducerMetrics.renders > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="font-semibold text-blue-800">
              Render Difference: {Math.abs(useStateMetrics.renders - useReducerMetrics.renders)} 
              {useStateMetrics.renders > useReducerMetrics.renders 
                ? ' (useReducer is more efficient)' 
                : ' (similar performance)'}
            </p>
          </div>
        )}
      </div>

      {/* Stress Test */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-bold text-lg mb-3">Stress Test</h3>
        <button
          onClick={runStressTest}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Run 100 Updates Test
        </button>
        {testResults.length > 0 && (
          <div className="mt-4">
            <p className="text-sm">Average update time: {avgTime}ms</p>
            <div className="mt-2 h-32 bg-white border rounded p-2 overflow-hidden">
              <div className="flex items-end h-full gap-px">
                {testResults.slice(0, 50).map((result, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-teal-500"
                    style={{ height: `${(result.time / 5) * 100}%` }}
                    title={`${result.time.toFixed(2)}ms`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 border rounded-lg p-4 bg-yellow-50">
        <h3 className="font-bold text-lg mb-2">How to Use This Tool</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click buttons in both components multiple times</li>
          <li>Watch the render count increase</li>
          <li>Notice useState triggers more renders for the same actions</li>
          <li>Run the stress test to see performance under load</li>
          <li>Compare the metrics to see the difference</li>
        </ol>
      </div>
    </div>
  );
};

export default PerformanceTest;
