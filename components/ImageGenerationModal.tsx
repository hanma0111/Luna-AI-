import React, { useState, useEffect, useRef } from 'react';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the textarea when modal opens
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      setPrompt(''); // Reset prompt when modal closes
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <h2 id="modal-title" className="text-xl font-semibold text-white mb-4">Generate an Image</h2>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A futuristic city skyline at sunset, with flying cars..."
          className="w-full h-32 bg-gray-900 border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          disabled={isLoading}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:bg-indigo-800 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
            from {
                transform: scale(0.95);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ImageGenerationModal;