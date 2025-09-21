import React from 'react';

export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.383-.03.766-.03 1.152 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25h3a2.25 2.25 0 0 0 2.25-2.25v-9" />
  </svg>
);