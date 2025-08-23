'use client';

import React from 'react';

interface SpinningLogoProps {
  width?: string;
  height?: string;
  className?: string;
}

const SpinningLogo = ({
  width = '130',
  height = '55',
  className = '',
}: SpinningLogoProps) => {
  return (
    <div className={`block transition-opacity duration-300 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox='0 0 130 162'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        {/* N - static */}
        <path
          d='M41.4619 57.1673L41.4835 49.6674L56.4834 49.7104L56.4619 57.2104L41.4619 57.1673ZM56.4619 57.2104L56.2927 116.171L41.2927 116.128L41.4619 57.1673L56.4619 57.2104Z'
          fill='#6B7280'
        />
        <path
          d='M115.622 49.1895L115.622 41.6895L100.622 41.6895L100.622 49.1895L115.622 49.1895ZM100.622 49.1895L100.622 110.051L115.622 110.051L115.622 49.1895L100.622 49.1895Z'
          fill='#6B7280'
        />
        <path
          d='M54.2652 44.1427L48.9619 38.8394L38.3553 49.446L43.6586 54.7493L54.2652 44.1427ZM43.6586 54.7493L107.12 118.21L117.726 107.604L54.2652 44.1427L43.6586 54.7493Z'
          fill='#6B7280'
        />

        {/* C - rotating */}
        <g className='nc-spin'>
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M119.082 133.546C108.298 141.406 95.0152 146.044 80.6494 146.044C44.5758 146.044 15.3325 116.801 15.3325 80.7273C15.3325 44.6538 44.5758 15.4104 80.6494 15.4104C95.0076 15.4104 108.284 20.0433 119.064 27.8957L129.777 17.183C116.197 6.66821 99.1538 0.4104 80.6494 0.4104C36.2916 0.4104 0.332458 36.3695 0.332458 80.7273C0.332458 125.085 36.2916 161.044 80.6494 161.044C99.1614 161.044 116.211 154.781 129.794 144.259L119.082 133.546Z'
            fill='#6B7280'
          />
        </g>
      </svg>
    </div>
  );
};

export default SpinningLogo;
