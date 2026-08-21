import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function DeleteAccountButton() {
    const { setUser } = useAuth();
    const navigate = useNavigate();

    async function handleDelete() {
        const confirmed = window.confirm(
            "are you sure you want to delete your account? you'll lose all chats!"
        );

        if (!confirmed) {
            return;
        }
        try {
            const response = await fetch(
                "http://localhost:3000/api/account",
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );
            if (!response.ok) {
                console.error("account deletion failed");
                return;
            }

            setUser(null);
            navigate("/login");
        } catch (error) {
            console.error("account deletion failed: ", error);
        }
    }

    return (
        <button onClick={handleDelete}>
            delete account
        </button>
    );
}

export default DeleteAccountButton;