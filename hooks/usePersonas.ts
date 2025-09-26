import { useState, useEffect, useCallback } from 'react';
import { Persona } from '../types';

// Helper to get personas from localStorage
const getPersonasFromStorage = (key: string): Persona[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Helper to get active persona id from localStorage
const getActivePersonaIdFromStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};


export const usePersonas = (currentUser: string | null) => {
  const PERSONAS_KEY = currentUser ? `luna-personas-${currentUser}` : '';
  const ACTIVE_PERSONA_KEY = currentUser ? `luna-active-persona-${currentUser}` : '';

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersonaId, setActivePersonaIdState] = useState<string | null>(null);

  // Load from storage on user change
  useEffect(() => {
    if (currentUser) {
      setPersonas(getPersonasFromStorage(PERSONAS_KEY));
      setActivePersonaIdState(getActivePersonaIdFromStorage(ACTIVE_PERSONA_KEY));
    } else {
      setPersonas([]);
      setActivePersonaIdState(null);
    }
  }, [currentUser, PERSONAS_KEY, ACTIVE_PERSONA_KEY]);

  // Save personas to storage
  const savePersonas = useCallback((updatedPersonas: Persona[]) => {
    if (!currentUser) return;
    try {
      localStorage.setItem(PERSONAS_KEY, JSON.stringify(updatedPersonas));
    } catch (error) {
      console.error("Failed to save personas:", error);
    }
  }, [currentUser, PERSONAS_KEY]);
  
  // Save active persona id to storage
  const setActivePersonaId = useCallback((id: string | null) => {
    if (!currentUser) return;
    try {
        if (id) {
            localStorage.setItem(ACTIVE_PERSONA_KEY, id);
        } else {
            localStorage.removeItem(ACTIVE_PERSONA_KEY);
        }
        setActivePersonaIdState(id);
    } catch (error) {
        console.error("Failed to set active persona:", error);
    }
  }, [currentUser, ACTIVE_PERSONA_KEY]);


  const addPersona = useCallback((name: string, prompt: string) => {
    const newPersona: Persona = { id: `persona-${Date.now()}`, name, prompt };
    setPersonas(prev => {
      const updated = [...prev, newPersona];
      savePersonas(updated);
      return updated;
    });
  }, [savePersonas]);

  const updatePersona = useCallback((id: string, name: string, prompt: string) => {
    setPersonas(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, name, prompt } : p);
      savePersonas(updated);
      return updated;
    });
  }, [savePersonas]);

  const deletePersona = useCallback((id: string) => {
    setPersonas(prev => {
      const updated = prev.filter(p => p.id !== id);
      savePersonas(updated);
      return updated;
    });
    // If the deleted persona was active, deactivate it
    if (activePersonaId === id) {
        setActivePersonaId(null);
    }
  }, [savePersonas, activePersonaId, setActivePersonaId]);

  return { personas, activePersonaId, addPersona, updatePersona, deletePersona, setActivePersonaId };
};