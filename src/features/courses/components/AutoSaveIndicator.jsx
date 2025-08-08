import React from 'react';

const AutoSaveIndicator = ({ isAutoSaving, lastSaved }) => {
  if (!isAutoSaving && !lastSaved) {
    return null;
  }

  return (
    <div className="flex items-center text-sm text-gray-500 mb-4">
      {isAutoSaving ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Saving...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Last saved {lastSaved?.toLocaleTimeString()}
        </>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
