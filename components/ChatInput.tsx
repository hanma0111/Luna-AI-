import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UpArrowIcon } from './icons/UpArrowIcon';
import { AttachIcon } from './icons/AttachIcon';
import { ImageIcon } from './icons/ImageIcon';
import { SearchIcon } from './icons/SearchIcon';
import { StudyIcon } from './icons/StudyIcon';
import { CodeIcon } from './icons/CodeIcon';
import { EditIcon } from './icons/EditIcon';
import { VideoIcon } from './icons/VideoIcon';
import ImageGenerationModal from './ImageGenerationModal';
import VideoGenerationModal from './VideoGenerationModal';
import { StopIcon } from './icons/StopIcon';

interface ImageAttachment {
  mimeType: string;
  data: string; // base64 string
}

interface ChatInputProps {
  onSendMessage: (message: string, attachment: ImageAttachment | null) => void;
  onGenerateImage: (prompt: string) => void;
  onEditImage: (prompt: string, attachment: ImageAttachment) => void;
  onGenerateVideo: (prompt: string) => void;
  onSearchQuery: (query: string) => void;
  onStudyTopic: (topic: string) => void;
  onCodeAssistant: (code: string) => void;
  onStopGeneration: () => void;
  isLoading: boolean;
  isLocked: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, onGenerateImage, onEditImage, onGenerateVideo, onSearchQuery, onStudyTopic, onCodeAssistant, onStopGeneration, 
  isLoading, isLocked 
}) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<(ImageAttachment & { name: string }) | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 150; 
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachment) && !isLoading && !isLocked) {
      onSendMessage(input.trim(), attachment);
      setInput('');
      setAttachment(null);
    }
  }, [input, attachment, isLoading, onSendMessage, isLocked]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  };

  const handleAttachClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("File is too large. Please select an image smaller than 4MB."); return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachment({ name: file.name, mimeType: file.type, data: base64String });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleEditClick = () => {
    if (!input.trim() || !attachment) {
      alert("Please attach an image and describe the edit you want to make in the text box."); return;
    }
    if (!isLoading && !isLocked) {
      onEditImage(input.trim(), attachment);
      setInput(''); setAttachment(null);
    }
  };

  const handleSearchClick = () => {
    if (!input.trim()) { alert("Please enter a search query in the text box."); return; }
    if (!isLoading && !isLocked) { onSearchQuery(input.trim()); setInput(''); setAttachment(null); }
  };
  
  const handleStudyClick = () => {
    if (!input.trim()) { alert("Please enter a topic to study in the text box."); return; }
    if (!isLoading && !isLocked) { onStudyTopic(input.trim()); setInput(''); setAttachment(null); }
  };

  const handleCodeClick = () => {
    if (!input.trim()) { alert("Please enter a code snippet in the text box."); return; }
    if (!isLoading && !isLocked) { onCodeAssistant(input.trim()); setInput(''); setAttachment(null); }
  };

  const handleGenerateImage = (prompt: string) => { onGenerateImage(prompt); setIsImageModalOpen(false); };
  const handleGenerateVideo = (prompt: string) => { onGenerateVideo(prompt); setIsVideoModalOpen(false); };

  const ActionButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, disabled?: boolean }> = 
  ({ icon, label, onClick, disabled = false }) => (
    <button
      type="button" onClick={onClick} disabled={isLoading || isLocked || disabled}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={label}
    >
      {icon}
      {label}
    </button>
  );

  const placeholderText = attachment 
    ? "Describe the edit you want to make..." 
    : "Ask anything, or attach an image...";

  return (
    <div className="flex flex-col items-center">
      {isLocked && (
        <div className="w-full text-center p-2 mb-2 bg-yellow-900/50 text-yellow-300 border border-yellow-700 rounded-lg text-sm">
          You've reached your free message limit. Please log in for unlimited access.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="w-full relative">
        <div className="flex flex-col border border-gray-700 rounded-2xl bg-gray-800 focus-within:border-gray-500 transition-colors">
            <textarea
                ref={textareaRef} value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? "Luna is thinking..." : placeholderText}
                className="w-full bg-transparent focus:outline-none resize-none px-4 pt-4 pb-12 placeholder-gray-500 disabled:opacity-50 overflow-y-auto"
                disabled={isLocked || isLoading} rows={1}
            />
            {attachment && !isLoading && (
              <div className="px-4 pb-3 text-xs text-gray-400 flex items-center gap-2 animate-fade-in">
                <span>Attached: {attachment.name}</span>
                <button type="button" onClick={() => setAttachment(null)} className="font-bold text-red-500 hover:text-red-400" aria-label="Remove attachment" disabled={isLocked}>
                  &times;
                </button>
              </div>
            )}
            {!isLoading && (
              <button type="submit" disabled={isLocked || (!input.trim() && !attachment)}
                  className="absolute right-3 bottom-3 p-2 bg-gray-600 rounded-full text-white hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Send message">
                  <UpArrowIcon className="w-5 h-5" />
              </button>
            )}
        </div>
      </form>
      
      {isLoading ? (
        <div className="flex items-center justify-center flex-wrap gap-2 mt-3">
            <button onClick={onStopGeneration} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                <StopIcon className="w-4 h-4" />
                Stop generating
            </button>
        </div>
      ) : (
        <div className="flex items-center justify-center flex-wrap gap-2 mt-3">
            <ActionButton icon={<AttachIcon className="w-4 h-4" />} label="Attach" onClick={handleAttachClick} />
            <ActionButton icon={<EditIcon className="w-4 h-4" />} label="Edit" onClick={handleEditClick} disabled={!attachment}/>
            <ActionButton icon={<ImageIcon className="w-4 h-4" />} label="Imagine" onClick={() => setIsImageModalOpen(true)} />
            <ActionButton icon={<VideoIcon className="w-4 h-4" />} label="Video" onClick={() => setIsVideoModalOpen(true)} />
            <ActionButton icon={<SearchIcon className="w-4 h-4" />} label="Search" onClick={handleSearchClick} />
            <ActionButton icon={<StudyIcon className="w-4 h-4" />} label="Study" onClick={handleStudyClick} />
            <ActionButton icon={<CodeIcon className="w-4 h-4" />} label="Coding" onClick={handleCodeClick} />
        </div>
      )}

      <ImageGenerationModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onGenerate={handleGenerateImage} isLoading={isLoading} />
      <VideoGenerationModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} onGenerate={handleGenerateVideo} isLoading={isLoading} />

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      <style>{`.animate-fade-in { animation: fade-in 0.3s ease; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};

export default ChatInput;