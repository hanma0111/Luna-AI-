import React, { useState } from 'react';
import { Message as MessageType, Role } from '../types';
import { SourceIcon } from './icons/SourceIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import CodeBlock from './CodeBlock';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const wrapperClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-indigo-600 rounded-2xl rounded-br-none'
    : 'bg-gray-700 rounded-2xl rounded-bl-none';

  if (message.role === Role.MODEL && !message.text.trim() && !message.imageUrl && !message.videoUrl) {
    return null;
  }
  if (message.role === Role.USER && !message.text.trim() && !message.imageUrl) {
    return null;
  }
  
  const handleDownload = () => {
    if (!message.imageUrl) return;
    const link = document.createElement('a');
    link.href = message.imageUrl;
    link.download = `luna-ai-image-${new Date().toISOString()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const renderMarkdown = (text: string) => {
    // 1. Bold: **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 2. Italics: *text*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // 3. Unordered lists: - item or * item
    text = text.replace(/^(?:\s*)\- (.*)/gm, '<li>$1</li>');
    text = text.replace(/^(?:\s*)\* (.*)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    text = text.replace(/<\/ul>\s*<ul>/g, ''); // Merge adjacent lists
    
    return <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: text }} />;
  };

  const renderMessageContent = (text: string) => {
    if (!text.includes('```')) {
      return renderMarkdown(text);
    }

    const parts = text.split(/(```[\w\s-]*\n[\s\S]*?\n```)/g);

    return parts.map((part, index) => {
      if (!part) return null;
      const codeMatch = part.match(/^```([\w\s-]*)?\n([\s\S]*)\n```$/);
      
      if (codeMatch) {
        const language = codeMatch[1]?.trim() || 'code';
        const code = codeMatch[2]?.trim() || '';
        return <CodeBlock key={index} language={language} code={code} />;
      } else {
        return <div key={index}>{renderMarkdown(part)}</div>;
      }
    });
  };

  return (
    <div className={`${wrapperClasses} w-full`}>
      <div className={`p-4 text-white max-w-xl md:max-w-2xl ${bubbleClasses}`}>
        {message.imageUrl && (
          <div className="relative group">
            <img
              src={message.imageUrl}
              alt={isUser ? "Attached image" : "Generated image"}
              className="rounded-lg mb-2 max-w-full h-auto"
            />
            {!isUser && (
                <button 
                    onClick={handleDownload}
                    className="absolute bottom-4 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    aria-label="Download image"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
            )}
          </div>
        )}

        {message.videoUrl && (
             <div className="mb-2">
                <video controls src={message.videoUrl} className="rounded-lg max-w-full h-auto" />
             </div>
        )}

        {message.text && (
          <div className="space-y-2">
            {renderMessageContent(message.text)}
          </div>
        )}
        
        {message.groundingChunks && message.groundingChunks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-600">
            <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
              <SourceIcon className="w-3 h-3" />
              Sources
            </h4>
            <ul className="space-y-1">
              {message.groundingChunks.map((chunk, index) => (
                <li key={index} className="truncate">
                  <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm underline" title={chunk.web.title}>
                    {chunk.web.title || chunk.web.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isUser && message.text && (
            <div className="pt-2 mt-2 -mb-2 -mr-2 flex justify-end">
                <button 
                    onClick={handleTextToSpeech}
                    className={`p-1 text-gray-400 hover:text-white transition-colors ${isSpeaking ? 'text-green-400' : ''}`}
                    aria-label={isSpeaking ? "Stop speaking" : "Read text aloud"}
                >
                    <SpeakerIcon className="w-4 h-4" />
                </button>
            </div>
        )}
      </div>
      <style>{`
        .prose {
          color: #D1D5DB; /* gray-300 */
        }
        .prose strong {
          color: #FFF;
        }
        .prose em {
          color: #E5E7EB; /* gray-200 */
        }
        .prose ul {
          padding-left: 1.25rem;
          list-style-type: disc;
        }
        .prose li {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
      `}</style>
    </div>
  );
};

export default Message;