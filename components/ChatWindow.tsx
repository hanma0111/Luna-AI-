import React, { useRef, useLayoutEffect } from 'react';
import { Message as MessageType, Role } from '../types';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';
import { RegenerateIcon } from './icons/RegenerateIcon';

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
  onRegenerate: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onRegenerate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const lastMessage = messages[messages.length - 1];
  const showLoading = isLoading && lastMessage?.role === Role.MODEL && !lastMessage?.text && !lastMessage?.imageUrl && !lastMessage.videoUrl;
  
  const canRegenerate = !isLoading && messages.length > 0 && lastMessage?.role === Role.MODEL;

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4 pb-10">
      {messages.map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
      {showLoading && (
        <div className="flex justify-start">
            <LoadingIndicator />
        </div>
      )}
      {canRegenerate && (
         <div className="flex justify-center">
            <button 
              onClick={onRegenerate}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RegenerateIcon className="w-4 h-4" />
              Regenerate
            </button>
         </div>
      )}
    </div>
  );
};

export default ChatWindow;