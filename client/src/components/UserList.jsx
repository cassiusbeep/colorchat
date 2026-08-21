import { useEffect, useState } from "react";

function UserList({ selectedUser, setSelectedUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/users`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error("couldn't get users from server");
                    return;
                }

                setUsers(data.users);
            } catch (error) {
                console.error("couldn't get users: ", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();

        const interval = setInterval(fetchUsers, 30_000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <p>loading users...</p>;
    }

    if (error) {
        return <p>error: {error}</p>;
    }

    // TODO: make each user clickable to open their chat!
    return (
        <section id="userlist">
            <h2>users</h2>

            {users.map((user) => (
                <div
                    key={user.id}
                    className="userlist-item"
                    onClick={() =>
                        setSelectedUser(user)}>
                    <div
                        className="userlist-status"
                        data-online={user.online}
                    ></div>
                    <div
                        className="userlist-name">
                        {user.username}
                    </div>
                </div>
            ))
            }
        </section >
    );
}

export default UserList;