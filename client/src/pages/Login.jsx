import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:3000/api/login",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(data.error);
                return;
            }

            console.log("logged in: ", data.user);
            setUser(data.user);
            navigate("/chat", {
                state: { newUser: false }
            });

        } catch (error) {
            console.error("login request failed: ", error);
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
                    log in
                </button>
            </form>

            <p>
                don't have an account?{" "}
                <Link to="/register">register</Link>
            </p>
        </main>
    );
}

export default Login;