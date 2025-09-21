import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(err => {
      console.error("Failed to copy code: ", err);
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg my-2 text-sm">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700/60 rounded-t-lg">
        <span className="text-gray-400 font-mono select-none">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 p-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-md text-xs transition-colors"
          aria-label="Copy code"
        >
          {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
          {isCopied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-gray-200">{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;