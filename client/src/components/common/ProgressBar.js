import React from 'react';

const ProgressBar = ({ value, max, type = 'calories', showLabel = true }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span>{value}g</span>
          <span className="text-muted">{max}g</span>
        </div>
      )}
      <div className="progress-bar">
        <div className={`progress-fill ${type}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;
