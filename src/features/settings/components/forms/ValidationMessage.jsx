import React from 'react';

/**
 * Reusable validation message component
 * @param {string} error - Error message
 * @param {string} warning - Warning message
 * @param {string} info - Info message
 */
const ValidationMessage = ({ error, warning, info }) => {
  if (!error && !warning && !info) return null;

  const type = error ? 'error' : warning ? 'warning' : 'info';
  
  const colors = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const message = error || warning || info;

  return (
    <div className={`flex items-start gap-2 p-2 rounded border ${colors[type]} text-xs mt-1`}>
      <span className="flex-shrink-0">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
};

export default ValidationMessage;
