import React, { useState } from 'react';
import { ChatHistory, ChatSession, Role } from '../types';
import { NewChatIcon } from './icons/NewChatIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ExportIcon } from './icons/ExportIcon';

interface ChatHistorySidebarProps {
  isOpen: boolean;
  history: ChatHistory;
  activeChatId: string | null;
  onNewChat: () => void;
  onSwitchChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onClose: () => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen, history, activeChatId, onNewChat, onSwitchChat, onDeleteChat, onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedSessions = Object.values(history.sessions).sort((a, b) => b.createdAt - a.createdAt);

  const filteredSessions = sortedSessions.filter(session => 
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleExport = (session: ChatSession) => {
      let content = `Chat with Luna AI - ${session.title}\n`;
      content += `Saved on: ${new Date(session.createdAt).toLocaleString()}\n\n`;
      
      session.messages.forEach(msg => {
          const prefix = msg.role === Role.USER ? 'You' : 'Luna';
          content += `--- ${prefix} ---\n`;
          if (msg.text) content += `${msg.text}\n`;
          if (msg.imageUrl) content += `[Image Attached: ${msg.imageUrl}]\n`;
          if (msg.videoUrl) content += `[Video Attached]\n`;
          content += `\n`;
      });
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `luna-chat-${session.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={onClose}></div>}
      <aside className={`absolute md:relative z-30 flex flex-col h-full w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <button onClick={onClose} className="md:hidden p-1"><CloseIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-2 border-b border-gray-700">
            <button onClick={onNewChat} className="w-full flex items-center gap-2 text-left p-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition-colors">
                <NewChatIcon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">New Chat</span>
            </button>
        </div>
        <div className="p-2 border-b border-gray-700">
            <input 
              type="search"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.map((session) => (
            <div key={session.id} className="group relative">
              <button onClick={() => onSwitchChat(session.id)} className={`w-full flex items-center gap-2 text-left p-2 rounded-md transition-colors ${activeChatId === session.id ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}>
                <ChatBubbleIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span className="truncate text-sm">{session.title}</span>
              </button>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleExport(session)} className="p-1 text-gray-500 hover:text-indigo-400" aria-label="Export chat">
                    <ExportIcon className="w-4 h-4" />
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Are you sure you want to delete this chat?')) { onDeleteChat(session.id); } }} className="p-1 text-gray-500 hover:text-red-400" aria-label="Delete chat">
                    <TrashIcon className="w-4 h-4" />
                 </button>
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default ChatHistorySidebar;