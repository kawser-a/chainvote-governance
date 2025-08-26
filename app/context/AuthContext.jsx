"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // { nid, cc } or null
    const [loading, setLoading] = useState(true);

    // Fetch current session
    async function fetchMe() {
        try {
            const res = await fetch("/api/me", { credentials: "include" });
            const data = await res.json();
            if (data.ok) {
                setUser({ nid: data.sub, cc: data.cc });
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMe();
    }, []);

    // Login (called after successful login API call)
    const login = async () => {
        await fetchMe();
    };

    // Logout
    const logout = async () => {
        await fetch("/api/logout", { method: "POST", credentials: "include" });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
