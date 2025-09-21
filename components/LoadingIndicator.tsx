
import React from 'react';
import { LunaIcon } from './icons/LunaIcon';

const LoadingIndicator: React.FC = () => {
  return (
     <div className="flex items-start gap-3 max-w-xl">
        <div className="flex-shrink-0 p-2 bg-gray-800 rounded-full">
            <LunaIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div className="p-4 text-white bg-gray-700 rounded-lg rounded-bl-none">
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
        </div>
      </div>
  );
};

export default LoadingIndicator;
