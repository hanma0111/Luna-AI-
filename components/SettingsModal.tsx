import React, { useState, useEffect, useRef } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onChangePassword: (username: string, oldPass: string, newPass: string) => Promise<{success: boolean, message?: string}>;
  onDeleteAccount: (username: string, pass: string) => Promise<{success: boolean, message?: string}>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, username, onChangePassword, onDeleteAccount }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => initialFocusRef.current?.focus(), 100);
    } else {
      // Reset state on close
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setDeletePassword('');
      setMessage(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: "New passwords do not match." });
        return;
    }
    setIsLoading(true);
    const result = await onChangePassword(username, oldPassword, newPassword);
    if (result.success) {
        setMessage({ type: 'success', text: "Password changed successfully." });
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } else {
        setMessage({ type: 'error', text: result.message || 'Failed to change password.' });
    }
    setIsLoading(false);
  }
  
  const handleDeleteAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!window.confirm(`Are you sure you want to permanently delete your account "${username}"? This action cannot be undone.`)) {
          return;
      }
      setMessage(null);
      setIsLoading(true);
      const result = await onDeleteAccount(username, deletePassword);
      if (!result.success) {
        setMessage({ type: 'error', text: result.message || 'Failed to delete account.' });
        setIsLoading(false);
      }
      // On success, the app will log out and this modal will close.
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-white mb-1">Settings</h2>
        <p className="text-sm text-gray-400 mb-6">Account: {username}</p>

        {message && (
          <div className={`p-3 rounded-md mb-4 text-sm ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            {message.text}
          </div>
        )}

        {/* Change Password */}
        <form onSubmit={handleChangePassword}>
          <h3 className="font-semibold text-white mb-3">Change Password</h3>
          <div className="space-y-3">
             <input type="password" placeholder="Old Password" ref={initialFocusRef} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="input-style" disabled={isLoading}/>
             <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="input-style" disabled={isLoading}/>
             <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="input-style" disabled={isLoading}/>
          </div>
          <button type="submit" className="button-style mt-4 bg-indigo-600 hover:bg-indigo-500" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        
        <hr className="border-gray-700 my-6" />

        {/* Delete Account */}
        <form onSubmit={handleDeleteAccount}>
            <h3 className="font-semibold text-red-400 mb-2">Delete Account</h3>
            <p className="text-xs text-gray-400 mb-3">Enter your password to confirm permanent deletion of your account and all associated data.</p>
            <input type="password" placeholder="Confirm with Password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} required className="input-style" disabled={isLoading} />
             <button type="submit" className="button-style w-full mt-4 bg-red-800 hover:bg-red-700" disabled={isLoading || !deletePassword}>
                {isLoading ? 'Deleting...' : 'Delete My Account'}
            </button>
        </form>

      </div>
      <style>{`
        .input-style {
            width: 100%;
            background-color: #1F2937; /* bg-gray-800 */
            border: 1px solid #374151; /* border-gray-700 */
            border-radius: 0.375rem; /* rounded-md */
            padding: 0.625rem;
            color: white;
            placeholder-color: #6B7280; /* placeholder-gray-500 */
        }
        .input-style:focus {
            outline: none;
            box-shadow: 0 0 0 2px #6366F1; /* ring-2 ring-indigo-500 */
        }
        .button-style {
             width: 100%;
             padding: 0.5rem 1rem;
             border-radius: 0.375rem;
             color: white;
             font-weight: 600;
             transition: background-color 0.2s;
        }
        .button-style:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        @keyframes fade-in-scale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in-scale { animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default SettingsModal;