// /app/context/AdminAuthContext.jsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);

    async function fetchMe() {
        try {
            const res = await fetch("/api/admin/me", { credentials: "include" });
            const data = await res.json();
            if (data.ok) {
                setAdmin({ username: data.sub });
            } else {
                setAdmin(null);
            }
        } catch {
            setAdmin(null);
        }
    }

    useEffect(() => {
        fetchMe();
    }, []);

    async function logout() {
        await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
        setAdmin(null);
        window.location.href = "/"; // redirect home
    }

    return (
        <AdminAuthContext.Provider value={{ admin, fetchMe, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}
