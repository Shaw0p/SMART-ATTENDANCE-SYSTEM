import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('srats_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const login = useCallback((userData, token) => {
        localStorage.setItem('srats_token', token);
        localStorage.setItem('srats_user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('srats_token');
        localStorage.removeItem('srats_user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
