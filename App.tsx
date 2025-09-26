import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { useChat } from './hooks/useChat';
import EmptyState from './components/EmptyState';
import { useAuth } from './hooks/useAuth';
import LoginModal from './components/LoginModal';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import { MenuIcon } from './components/icons/MenuIcon';
import { CloseIcon } from './components/icons/CloseIcon';
import SettingsModal from './components/SettingsModal';
import { GearIcon } from './components/icons/GearIcon';
import { ChevronDownIcon } from './components/icons/ChevronDownIcon';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePersonas } from './hooks/usePersonas';
import { Persona } from './types';


const App: React.FC = () => {
  const { currentUser, isLoggedIn, login, signup, logout, changePassword, deleteAccount } = useAuth();
  const [lunaVersion, setLunaVersion] = useState<'1.0' | '2.0'>('1.0');
  const { personas, activePersonaId, addPersona, updatePersona, deletePersona, setActivePersonaId } = usePersonas(currentUser);

  const activePersona = personas.find(p => p.id === activePersonaId);
  
  const { 
    messages, chatHistory, activeChatId,
    sendMessage, isLoading, startNewChat,
    switchChat, deleteChat, generateImage, 
    editImage, generateVideo, searchQuery, 
    studyTopic, codeAssistant, regenerateLastResponse,
    stopGeneration, isLocked, debugError
  } = useChat(currentUser, lunaVersion, activePersona);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVersionMenuOpen, setIsVersionMenuOpen] = useState(false);
  const versionMenuRef = useRef<HTMLDivElement>(null);


  const handleLogout = () => {
    logout();
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const success = await login(username, password);
    if (success) {
      setIsLoginModalOpen(false);
      return true;
    }
    return false;
  };
  
  const handleSignup = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const result = await signup(username, password);
    if (result.success) {
      setIsLoginModalOpen(false);
    }
    return result;
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsLoginModalOpen(true);
  };
  
  const handlePersonaChange = (persona: Persona | null, version?: '1.0' | '2.0') => {
    const currentActiveId = activePersonaId;
    const currentVersion = lunaVersion;

    let changed = false;
    if (persona) {
      if (activePersonaId !== persona.id) {
        setActivePersonaId(persona.id);
        changed = true;
      }
    } else {
      if (activePersonaId !== null) {
        setActivePersonaId(null);
        changed = true;
      }
      if (version && lunaVersion !== version) {
        setLunaVersion(version);
        changed = true;
      }
    }

    if (changed) {
      startNewChat();
    }
    setIsVersionMenuOpen(false);
  };

  // Close version dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (versionMenuRef.current && !versionMenuRef.current.contains(event.target as Node)) {
        setIsVersionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPersonaName = activePersona ? activePersona.name : `Luna AI ${lunaVersion}`;

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <ErrorBoundary onDebug={debugError} onReset={startNewChat}>
        <ChatHistorySidebar
            isOpen={isSidebarOpen}
            history={chatHistory}
            activeChatId={activeChatId}
            onNewChat={startNewChat}
            onSwitchChat={switchChat}
            onDeleteChat={deleteChat}
            onClose={() => setIsSidebarOpen(false)}
        />

        <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:pl-64' : ''}`}>
            <header className="absolute top-0 left-0 right-0 z-10 p-4">
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                    <div className="flex items-center justify-start md:w-1/3">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2">
                            {isSidebarOpen ? <CloseIcon className="w-6 h-6"/> : <MenuIcon className="w-6 h-6"/>}
                        </button>
                    </div>

                    {/* Version Selector */}
                    <div className="relative" ref={versionMenuRef}>
                      <button 
                        onClick={() => setIsVersionMenuOpen(!isVersionMenuOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-lg font-semibold truncate max-w-48">{currentPersonaName}</span>
                        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isVersionMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isVersionMenuOpen && (
                        <div className="absolute top-full mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 animate-fade-in-scale">
                          <button onClick={() => handlePersonaChange(null, '1.0')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700">
                            <strong className="block">Luna 1.0</strong>
                            <span className="text-xs text-gray-400">Friendly, helpful assistant</span>
                          </button>
                          <button onClick={() => handlePersonaChange(null, '2.0')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700">
                            <strong className="block">Luna 2.0</strong>
                             <span className="text-xs text-gray-400">Advanced, expert assistant</span>
                          </button>
                          {isLoggedIn && personas.length > 0 && (
                            <>
                              <hr className="border-gray-700 my-1"/>
                              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500">CUSTOM PERSONAS</div>
                              {personas.map(p => (
                                <button key={p.id} onClick={() => handlePersonaChange(p)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700">
                                  <strong className="block truncate">{p.name}</strong>
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 md:w-1/3">
                      {isLoggedIn && currentUser && (
                         <button
                          onClick={() => setIsSettingsModalOpen(true)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          aria-label="Settings"
                        >
                          <GearIcon className="w-5 h-5" />
                        </button>
                      )}
                      {isLoggedIn ? (
                          <button
                          onClick={handleLogout}
                          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                          Log out
                          </button>
                      ) : (
                          <button
                          onClick={() => openAuthModal('login')}
                          className="bg-white hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                          Log in
                          </button>
                      )}
                    </div>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto pt-20">
                {messages.length === 0 && !isLoading ? (
                  <EmptyState />
                ) : (
                <ChatWindow 
                  messages={messages} 
                  isLoading={isLoading} 
                  onRegenerate={regenerateLastResponse}
                />
                )}
            </main>

            <footer className="pb-4 sm:pb-8 px-4">
                <div className="max-w-4xl mx-auto">
                <ChatInput 
                    onSendMessage={sendMessage} 
                    onGenerateImage={generateImage}
                    onEditImage={editImage}
                    onGenerateVideo={generateVideo}
                    onSearchQuery={searchQuery}
                    onStudyTopic={studyTopic}
                    onCodeAssistant={codeAssistant}
                    onStopGeneration={stopGeneration}
                    isLoading={isLoading} 
                    isLocked={isLocked}
                />
                <p className="text-center text-xs text-gray-500 mt-3 px-4">
                    By messaging Luna, you agree to our Terms and have read our Privacy Policy.
                </p>
                </div>
            </footer>
        </div>
      </ErrorBoundary>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        initialMode={authModalMode}
      />
      {isLoggedIn && currentUser && (
        <SettingsModal 
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          username={currentUser}
          onChangePassword={changePassword}
          onDeleteAccount={deleteAccount}
          personas={personas}
          onAddPersona={addPersona}
          onUpdatePersona={updatePersona}
          onDeletePersona={deletePersona}
        />
      )}
      <style>{`
        @keyframes fade-in-scale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in-scale { animation: fade-in-scale 0.1s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
