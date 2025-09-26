import React, { useState, useEffect, useRef } from 'react';
import { Persona } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onChangePassword: (username: string, oldPass: string, newPass: string) => Promise<{success: boolean, message?: string}>;
  onDeleteAccount: (username: string, pass: string) => Promise<{success: boolean, message?: string}>;
  personas: Persona[];
  onAddPersona: (name: string, prompt: string) => void;
  onUpdatePersona: (id: string, name: string, prompt: string) => void;
  onDeletePersona: (id: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, username, onChangePassword, onDeleteAccount, 
    personas, onAddPersona, onUpdatePersona, onDeletePersona 
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  // Persona form state
  const [editingId, setEditingId] = useState<string | null | 'new'>(null);
  const [formName, setFormName] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const personaFormRef = useRef<HTMLFormElement>(null);


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
      setEditingId(null);
      setFormName('');
      setFormPrompt('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  useEffect(() => {
      if(editingId) {
          personaFormRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [editingId]);
  
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
  }

  const handleStartEdit = (persona: Persona) => {
      setEditingId(persona.id);
      setFormName(persona.name);
      setFormPrompt(persona.prompt);
  };

  const handleStartAdd = () => {
      setEditingId('new');
      setFormName('');
      setFormPrompt('');
  }

  const handleCancelEdit = () => {
      setEditingId(null);
      setFormName('');
      setFormPrompt('');
  };

  const handleSavePersona = (e: React.FormEvent) => {
      e.preventDefault();
      if (formName.trim() && formPrompt.trim() && editingId) {
          if (editingId === 'new') {
              onAddPersona(formName.trim(), formPrompt.trim());
          } else {
              onUpdatePersona(editingId, formName.trim(), formPrompt.trim());
          }
          handleCancelEdit();
      }
  };

  const PersonaForm = () => (
    <form onSubmit={handleSavePersona} className="bg-gray-700/50 p-4 rounded-lg mt-2 mb-4 animate-fade-in-scale-sm" ref={personaFormRef}>
        <input 
            type="text" 
            placeholder="Persona Name (e.g., 'Sarcastic Pirate')" 
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm mb-2"
        />
        <textarea 
            placeholder="System prompt (e.g., 'You are a pirate captain...')" 
            value={formPrompt}
            onChange={(e) => setFormPrompt(e.target.value)}
            className="w-full h-24 bg-gray-900 border border-gray-600 rounded-md p-2 text-sm resize-none"
        />
        <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={handleCancelEdit} className="px-3 py-1 bg-gray-600 text-xs rounded-md hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-3 py-1 bg-indigo-600 text-xs rounded-md hover:bg-indigo-500 disabled:opacity-50" disabled={!formName.trim() || !formPrompt.trim()}>Save</button>
        </div>
    </form>
  );

  // Fix: Return null if the modal is not open, which is required for a React Function Component.
  if (!isOpen) return null;

  // Fix: Added the JSX return for the modal component. The component was missing a return statement, causing a type error.
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="settings-title"
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <div className="flex-shrink-0">
            <h2 id="settings-title" className="text-xl font-semibold text-white mb-4">Settings</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8">
          {/* --- ACCOUNT --- */}
          <section>
            <h3 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">Account</h3>
            <p className="text-sm text-gray-400 mb-4">Logged in as: <strong className="text-gray-200">{username}</strong></p>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <h4 className="font-semibold text-gray-300">Change Password</h4>
              <input ref={initialFocusRef} type="password" placeholder="Old Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-sm" />
              <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-sm" />
              <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-sm" />
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50">Save Changes</button>
            </form>
          </section>

          {/* --- PERSONAS --- */}
          <section>
            <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
              <h3 className="text-lg font-semibold text-gray-200">Custom Personas</h3>
              <button onClick={handleStartAdd} disabled={!!editingId} className="px-3 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50">Add New</button>
            </div>
            
            {editingId === 'new' && <PersonaForm />}
            
            <div className="space-y-2">
              {personas.map(p => (
                editingId === p.id 
                ? <PersonaForm key={p.id} />
                : (
                  <div key={p.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-md">
                    <p className="text-sm font-medium truncate pr-4">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleStartEdit(p)} disabled={!!editingId} className="p-1 text-gray-400 hover:text-white disabled:opacity-50"><EditIcon className="w-4 h-4" /></button>
                      <button onClick={() => onDeletePersona(p.id)} disabled={!!editingId} className="p-1 text-gray-400 hover:text-red-400 disabled:opacity-50"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                )
              ))}
              {personas.length === 0 && !editingId && <p className="text-sm text-gray-500 text-center py-4">You haven't created any custom personas yet.</p>}
            </div>
          </section>
          
          {/* --- DANGER ZONE --- */}
          <section className="border-t border-red-900/50 pt-6">
            <h3 className="text-lg font-semibold text-red-400 mb-3">Danger Zone</h3>
            <form onSubmit={handleDeleteAccount} className="space-y-3 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
                <h4 className="font-semibold text-gray-300">Delete Account</h4>
                <p className="text-xs text-red-300">This will permanently delete your account and all associated data. This action cannot be undone. Please enter your password to confirm.</p>
                <input type="password" placeholder="Enter your password to confirm" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-sm" />
                <button type="submit" disabled={isLoading || !deletePassword} className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-500 transition-colors disabled:opacity-50">Delete My Account</button>
            </form>
          </section>
        </div>

        <div className="flex-shrink-0 mt-6 flex justify-between items-center">
            {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>
            )}
            <button
                type="button" onClick={onClose}
                className="ml-auto px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
                Close
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in-scale { animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in-scale-sm { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in-scale-sm { animation: fade-in-scale-sm 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

// Fix: Added a default export, which was missing and causing an import error in App.tsx.
export default SettingsModal;
