import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return <p>loading...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// fix this, it just says "not found" instead of switching to login

export default ProtectedRoute;