import React, { ErrorInfo } from 'react';
import { NewChatIcon } from './icons/NewChatIcon';
import { CodeIcon } from './icons/CodeIcon';

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  onDebug: () => void;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onDebug, onReset }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-red-400 mb-4">Oops! Something went wrong.</h1>
        <p className="text-gray-400 mb-8">
          Luna encountered an unexpected error. You can try starting a new chat, or use Luna's self-debugging ability to analyze the problem.
        </p>
        
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
          >
            <NewChatIcon className="w-5 h-5" />
            Start a New Chat
          </button>
           <button
            onClick={onDebug}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            <CodeIcon className="w-5 h-5" />
            Ask Luna to Debug
          </button>
        </div>

        <details className="text-left bg-gray-800 rounded-lg p-1">
          <summary className="cursor-pointer text-gray-400 p-3 hover:text-white">
            Show Technical Details
          </summary>
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error Message</h3>
            <pre className="text-sm bg-gray-900 p-3 rounded-md overflow-x-auto text-red-300">
              <code>{error.toString()}</code>
            </pre>
            <h3 className="text-lg font-semibold text-yellow-400 mt-4 mb-2">Component Stack</h3>
            <pre className="text-xs bg-gray-900 p-3 rounded-md overflow-x-auto text-yellow-300">
              <code>{errorInfo.componentStack}</code>
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ErrorFallback;