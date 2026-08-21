import { useState, useEffect } from "react";

function MessageDisplay({ selectedUser }) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!selectedUser) {
            setMessages([]);
            return;
        }

        async function fetchMessages() {
            const response = await fetch(
                `http://localhost:3000/api/messages?userId=${selectedUser.id}`,
                {
                    credentials: "include"
                }
            );
            const data = await response.json();
            setMessages(data.messages);
        }

        fetchMessages();
    }, [selectedUser]);

    return (
        selectedUser ? (
            <section id="chat-window" >
                <h2>chat with {selectedUser.username}</h2>
                {messages.map((msg) => (
                    <div
                        key={msg.msg_id}
                        className={`color-message 
                            ${msg.sent ? 'received-msg' : 'sent-msg'}`}
                        style={{
                            backgroundColor: msg.color,
                            height: msg.height + 'px'
                        }}
                    >
                    </div>
                ))
                }
            </section >
        ) : (
            <section id="chat-window">
                <h2>select a user</h2>
            </section>
        )
    );
}

export default MessageDisplay;