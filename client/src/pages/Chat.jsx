import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";
import DeleteAccountButton from "../components/DeleteAccountButton";
import UserList from "../components/UserList";
import SendChat from "../components/SendChat";
import MessageDisplay from "../components/MessageDisplay";

function Chat() {
    const location = useLocation();
    const newUser = location.state?.newUser;
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);

    return (
        <main>
            <h1>Color Chat</h1>
            {newUser && <p>hi {user.username}! ready to get started? :)</p>}
            {!newUser && <p>welcome back, {user.username}!</p>}
            <LogoutButton />
            <DeleteAccountButton />
            <UserList
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
            />
            <MessageDisplay
                selectedUser={selectedUser}
                messages={messages}
                setMessages={setMessages}
            />
            <SendChat
                selectedUser={selectedUser}
                messages={messages}
                setMessages={setMessages}
            />
        </main>
    );
}

// TODO: move messages up to Chat so that sendchat and messagedisplay can share them, allowing for instant refresh/display of newly sent messages.

export default Chat;