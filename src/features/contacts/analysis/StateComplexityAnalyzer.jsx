/**
 * State Complexity Analyzer
 * Tool to measure and compare state management complexity before/after useReducer
 */

import { useState, useReducer, useEffect, useRef } from 'react';

// Metrics tracking hook
export const useStateMetrics = (label = 'Component') => {
  const renderCount = useRef(0);
  const stateUpdates = useRef(0);
  const updateTimestamps = useRef([]);
  
  useEffect(() => {
    renderCount.current += 1;
  });

  const trackUpdate = (updateType) => {
    stateUpdates.current += 1;
    updateTimestamps.current.push({
      type: updateType,
      timestamp: Date.now(),
    });
  };

  const getMetrics = () => ({
    label,
    renderCount: renderCount.current,
    stateUpdates: stateUpdates.current,
    avgUpdatesPerRender: (stateUpdates.current / renderCount.current).toFixed(2),
    recentUpdates: updateTimestamps.current.slice(-10),
  });

  return { trackUpdate, getMetrics };
};

// Performance comparison component
export const StatePerformanceComparison = ({ beforeMetrics, afterMetrics }) => {
  const improvement = {
    renders: ((beforeMetrics.renderCount - afterMetrics.renderCount) / beforeMetrics.renderCount * 100).toFixed(1),
    updates: ((beforeMetrics.stateUpdates - afterMetrics.stateUpdates) / beforeMetrics.stateUpdates * 100).toFixed(1),
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-bold text-lg mb-4">Performance Comparison</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded shadow">
          <h4 className="font-semibold text-red-600 mb-2">Before (useState)</h4>
          <p>Renders: {beforeMetrics.renderCount}</p>
          <p>State Updates: {beforeMetrics.stateUpdates}</p>
          <p>Avg Updates/Render: {beforeMetrics.avgUpdatesPerRender}</p>
        </div>
        
        <div className="bg-white p-3 rounded shadow">
          <h4 className="font-semibold text-green-600 mb-2">After (useReducer)</h4>
          <p>Renders: {afterMetrics.renderCount}</p>
          <p>State Updates: {afterMetrics.stateUpdates}</p>
          <p>Avg Updates/Render: {afterMetrics.avgUpdatesPerRender}</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded">
        <h4 className="font-semibold mb-2">Improvements</h4>
        <p className="text-green-600">
          ✓ {improvement.renders}% fewer renders
        </p>
        <p className="text-green-600">
          ✓ {improvement.updates}% fewer state updates
        </p>
      </div>
    </div>
  );
};

// Code complexity analyzer
export const analyzeCodeComplexity = (componentCode) => {
  const metrics = {
    useStateCount: (componentCode.match(/useState\(/g) || []).length,
    useReducerCount: (componentCode.match(/useReducer\(/g) || []).length,
    setStateCallsCount: (componentCode.match(/set[A-Z]\w+\(/g) || []).length,
    dispatchCallsCount: (componentCode.match(/dispatch\(/g) || []).length,
    linesOfCode: componentCode.split('\n').length,
    stateRelatedLines: componentCode.split('\n').filter(line => 
      line.includes('useState') || 
      line.includes('set') || 
      line.includes('useReducer') ||
      line.includes('dispatch')
    ).length,
  };

  metrics.stateComplexityScore = 
    (metrics.useStateCount * 2) + 
    (metrics.setStateCallsCount * 1) + 
    (metrics.useReducerCount * 0.5) + 
    (metrics.dispatchCallsCount * 0.3);

  return metrics;
};

// Visual complexity comparison
export const ComplexityComparison = ({ beforeCode, afterCode }) => {
  const before = analyzeCodeComplexity(beforeCode);
  const after = analyzeCodeComplexity(afterCode);

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-bold text-lg mb-4">Code Complexity Analysis</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Metric</th>
              <th className="text-center p-2">Before</th>
              <th className="text-center p-2">After</th>
              <th className="text-center p-2">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">useState hooks</td>
              <td className="text-center p-2">{before.useStateCount}</td>
              <td className="text-center p-2">{after.useStateCount}</td>
              <td className="text-center p-2 text-green-600">
                {before.useStateCount - after.useStateCount > 0 ? '↓' : '→'} 
                {Math.abs(before.useStateCount - after.useStateCount)}
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2">useReducer hooks</td>
              <td className="text-center p-2">{before.useReducerCount}</td>
              <td className="text-center p-2">{after.useReducerCount}</td>
              <td className="text-center p-2 text-blue-600">
                {after.useReducerCount - before.useReducerCount > 0 ? '↑' : '→'} 
                {Math.abs(after.useReducerCount - before.useReducerCount)}
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2">setState calls</td>
              <td className="text-center p-2">{before.setStateCallsCount}</td>
              <td className="text-center p-2">{after.setStateCallsCount}</td>
              <td className="text-center p-2 text-green-600">
                {before.setStateCallsCount - after.setStateCallsCount > 0 ? '↓' : '→'} 
                {Math.abs(before.setStateCallsCount - after.setStateCallsCount)}
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2">dispatch calls</td>
              <td className="text-center p-2">{before.dispatchCallsCount}</td>
              <td className="text-center p-2">{after.dispatchCallsCount}</td>
              <td className="text-center p-2 text-blue-600">
                {after.dispatchCallsCount - before.dispatchCallsCount > 0 ? '↑' : '→'} 
                {Math.abs(after.dispatchCallsCount - before.dispatchCallsCount)}
              </td>
            </tr>
            <tr className="border-b font-bold">
              <td className="p-2">Complexity Score</td>
              <td className="text-center p-2">{before.stateComplexityScore.toFixed(1)}</td>
              <td className="text-center p-2">{after.stateComplexityScore.toFixed(1)}</td>
              <td className="text-center p-2 text-green-600">
                ↓ {(before.stateComplexityScore - after.stateComplexityScore).toFixed(1)}
                ({((1 - after.stateComplexityScore / before.stateComplexityScore) * 100).toFixed(1)}%)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default {
  useStateMetrics,
  StatePerformanceComparison,
  analyzeCodeComplexity,
  ComplexityComparison,
};
