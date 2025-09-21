import React from 'react';
import { LunaIcon } from './icons/LunaIcon';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="text-center">
             <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
                Luna AI
            </h1>
        </div>
    </div>
  );
};

export default EmptyState;
