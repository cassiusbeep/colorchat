import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Register() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    }),
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(data.error);
                return;
            }

            setUser(data.user);
            navigate("/chat", {
                state: { newUser: true }
            });

        } catch (error) {
            console.error("registration failed: ", error);
        }
    }

    return (
        <main>
            <h1>Color Chat</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    username
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </label>
                <br />
                <label>
                    password
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>
                <br />
                <button type="submit">
                    register
                </button>
            </form>
            <p>
                already signed up?{" "}
                <Link to="/login">log in</Link>
            </p>
        </main>
    );
}

export default Register;