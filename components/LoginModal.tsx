import React, { useState, useEffect, useRef } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { GithubIcon } from './icons/GithubIcon';
import { MicrosoftIcon } from './icons/MicrosoftIcon';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onSignup: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  initialMode?: 'login' | 'signup';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onSignup, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state and focus the username input when modal opens
      setError('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setMode(initialMode);
      setTimeout(() => usernameInputRef.current?.focus(), 100);
    }
  }, [isOpen, initialMode]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup') {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
    }
    
    setIsLoading(true);

    if (mode === 'login') {
        const success = await onLogin(username, password);
        if (!success) {
            setError('Invalid username or password.');
        }
    } else {
        const result = await onSignup(username, password);
        if (!result.success) {
            setError(result.message || 'An error occurred during sign up.');
        }
    }

    setIsLoading(false);
  };
  
  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError('');
  }

  const SocialButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const isLoginMode = mode === 'login';
  const title = isLoginMode ? 'Log in to Luna AI' : 'Create an Account';
  const buttonText = isLoginMode ? 'Log in' : 'Sign up';

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <h2 id="modal-title" className="text-xl font-semibold text-white mb-4 text-center">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                ref={usernameInputRef}
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLoginMode ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
            </div>
            {!isLoginMode && (
                <div>
                    <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                    <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                </div>
            )}
             {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
            )}
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading || !username || !password || (!isLoginMode && !confirmPassword)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:bg-indigo-800 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                buttonText
              )}
            </button>
          </div>
           <p className="text-xs text-gray-500 mt-4 text-center">
              {isLoginMode ? (
                <>
                  No account?{' '}
                  <button type="button" onClick={toggleMode} className="font-medium text-indigo-400 hover:text-indigo-300">Sign up</button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={toggleMode} className="font-medium text-indigo-400 hover:text-indigo-300">Log in</button>
                </>
              )}
            </p>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-800 px-2 text-gray-400">OR</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <SocialButton
            icon={<GoogleIcon className="w-5 h-5" />}
            label="Continue with Google"
            onClick={() => alert('Social login is for demonstration purposes only.')}
          />
          <SocialButton
            icon={<GithubIcon className="w-5 h-5" />}
            label="Continue with GitHub"
            onClick={() => alert('Social login is for demonstration purposes only.')}
          />
          <SocialButton
            icon={<MicrosoftIcon className="w-5 h-5" />}
            label="Continue with Microsoft"
            onClick={() => alert('Social login is for demonstration purposes only.')}
          />
        </div>

      </div>
      <style>{`
        @keyframes fade-in-scale {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default LoginModal;