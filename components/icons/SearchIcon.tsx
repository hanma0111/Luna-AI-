import React from 'react';

export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21V3"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.55 16.5A9.03 9.03 0 0 0 12 21a9.03 9.03 0 0 0 8.45-4.5"
    />
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.55 7.5A9.03 9.03 0 0 1 12 3a9.03 9.03 0 0 1 8.45 4.5"
    />
  </svg>
);