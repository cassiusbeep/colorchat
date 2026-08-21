import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
    const { setUser } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            const response = await fetch(
                "http://localhost:3000/api/logout",
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                console.error("logout failed");
                return;
            }

            setUser(null);
            navigate("/login");
        } catch (error) {
            console.error("logout failed: ", error);
        }
    }

    return (
        <button onClick={handleLogout}>
            log out
        </button>
    );
}

export default LogoutButton;