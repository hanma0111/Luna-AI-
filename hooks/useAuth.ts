import { useState, useCallback } from 'react';

// --- Types ---
// NOTE: In a real app, never store plain text passwords. This is for simulation only.
interface User {
  username: string;
  passwordHash: string; // Storing a "hash" is better practice than plain text
}

// --- Constants ---
const USERS_STORAGE_KEY = 'luna-users';
const CURRENT_USER_STORAGE_KEY = 'luna-current-user';

// --- Helper Functions ---
// A simple, non-cryptographic hash for demonstration purposes.
// A real app should use a robust library like bcrypt.
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

const getUsers = (): User[] => {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: User[]) => {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Failed to save users:", error);
    }
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const isLoggedIn = !!currentUser;

  const signup = useCallback(async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const users = getUsers();
        if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
          resolve({ success: false, message: 'Username is already taken.' });
          return;
        }
        if (password.length < 6) {
          resolve({ success: false, message: 'Password must be at least 6 characters.' });
          return;
        }

        const newUser: User = { username, passwordHash: simpleHash(password) };
        users.push(newUser);
        
        try {
          saveUsers(users);
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, username);
          setCurrentUser(username);
          resolve({ success: true });
        } catch (error) {
          console.error('Failed to save new user:', error);
          resolve({ success: false, message: 'Could not create account. Storage might be full.' });
        }
      }, 500);
    });
  }, []);


  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const users = getUsers();
        const passwordHash = simpleHash(password);
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === passwordHash);
        
        if (user) {
          try {
            localStorage.setItem(CURRENT_USER_STORAGE_KEY, user.username);
            setCurrentUser(user.username);
            resolve(true);
          } catch (error) {
             console.error('Failed to save session:', error);
             resolve(false);
          }
        } else {
          resolve(false);
        }
      }, 500);
    });
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
    setCurrentUser(null);
  }, []);

  const changePassword = useCallback(async (username: string, oldPassword: string, newPassword: string): Promise<{success: boolean, message?: string}> => {
    return new Promise(resolve => {
      setTimeout(() => {
        let users = getUsers();
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex === -1) {
          return resolve({ success: false, message: "User not found."});
        }
        if (users[userIndex].passwordHash !== simpleHash(oldPassword)) {
          return resolve({ success: false, message: "Incorrect old password."});
        }
        if (newPassword.length < 6) {
          return resolve({ success: false, message: "New password must be at least 6 characters."});
        }
        users[userIndex].passwordHash = simpleHash(newPassword);
        saveUsers(users);
        resolve({ success: true });
      }, 500);
    });
  }, []);

  const deleteAccount = useCallback(async (username: string, password: string): Promise<{success: boolean, message?: string}> => {
     return new Promise(resolve => {
        setTimeout(() => {
            let users = getUsers();
            const user = users.find(u => u.username === username);
             if (!user || user.passwordHash !== simpleHash(password)) {
                return resolve({ success: false, message: "Incorrect password."});
            }

            const updatedUsers = users.filter(u => u.username !== username);
            saveUsers(updatedUsers);
            
            // Log the user out and clear their data
            logout();
            try {
              localStorage.removeItem(`luna-chat-data-${username}`);
            } catch (e) {
              console.error("Could not remove chat data for deleted user", e);
            }

            resolve({ success: true });
        }, 500);
     });
  }, [logout]);


  return { currentUser, isLoggedIn, login, signup, logout, changePassword, deleteAccount };
};