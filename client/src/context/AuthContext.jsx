import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const HEARTBEAT_INTERVAL = 30_000

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function sendHeartbeat() {
        try {
            const response = await fetch(
                "http://localhost:3000/api/heartbeat",
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (!response.ok && response.status !== 401) {
                console.error("heartbeat failed");
            }
        } catch (error) {
            console.error("heartbeat request failed:", error);
        }
    }

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/me",
                    {
                        credentials: "include"
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        sendHeartbeat();

        const interval = setInterval(() => {
            sendHeartbeat();
        }, HEARTBEAT_INTERVAL);

        return () => {
            clearInterval(interval);
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}