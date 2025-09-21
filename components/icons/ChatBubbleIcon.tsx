import React from 'react';

export const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.28c-.443.034-.884-.11-1.22-.412a2.992 2.992 0 0 0-2.624 0c-.336.302-.777.446-1.22.412l-3.722-.28A2.122 2.122 0 0 1 3 15.182V10.608c0-.97.616-1.813 1.5-2.097L6.6 8.125c.44-.132.88-.34 1.28-.62a2.991 2.991 0 0 0 2.624 0c.4.28.84.488 1.28.62l2.1.626Z"
    />
  </svg>
);
