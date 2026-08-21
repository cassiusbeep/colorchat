import { useState } from "react";

function SendChat({ selectedUser }) {
    const [color, setColor] = useState("#FF00AA");

    function isValidHex(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    async function handleSend(event) {
        event.preventDefault();

        if (!selectedUser) {
            return;
        }

        if (!isValidHex(color)) {
            console.error("invalid color");
            return;
        }

        console.log(`sending ${color} to ${selectedUser.username}`);

        try {
            const response = await fetch(
                "http://localhost:3000/api/messages",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        color: color,
                        recipientId: selectedUser.id
                    })
                }
            );
            if (!response.ok) {
                console.error("send chat failed");
                return;
            }
            setColor("");
        } catch (error) {
            console.error("send chat failed: ", error);
        }
    }

    return (
        selectedUser ? (
            <section id="chat-box" >
                <form onSubmit={handleSend}>
                    <input
                        type="color"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                        placeholder="#FF00AA"
                    />
                    <button
                        type="submit"
                        onClick={handleSend}>
                        send chat
                    </button>
                </form>
            </section>
        ) : (
            <section id="chat-box">
                <p>select a user</p>
            </section>
        )
    );
}

export default SendChat;