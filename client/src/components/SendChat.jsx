import { useState } from "react";
import EditChat from "./EditChat";

function SendChat({ selectedUser, messages, setMessages }) {
    const [color, setColor] = useState("#FF00AA");
    const [height, setHeight] = useState(25);

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

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/messages`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        color: color,
                        recipientId: selectedUser.id,
                        height: height
                    })
                }
            );
            const data = await response.json();

            if (!response.ok) {
                console.error("send chat failed");
                return;
            }

            setMessages((currentMessages) => [
                ...currentMessages,
                data.message
            ]);

        } catch (error) {
            console.error("send chat failed: ", error);
        }
    }

    return (
        selectedUser ? (
            <section id="chat-box" >
                <form onSubmit={handleSend}>
                    {/* <input
                        type="color"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                        placeholder="#FF00AA"
                    /> */}
                    <EditChat
                        color={color}
                        setColor={setColor}
                        height={height}
                        setHeight={setHeight}
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