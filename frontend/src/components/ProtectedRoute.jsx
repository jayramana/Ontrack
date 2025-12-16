import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();
    const { isAuthenticated, hasRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        console.log("ProtectedRoute: User not authenticated. Redirecting to login.");
        return <Navigate to="/" replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        console.log(`ProtectedRoute: Role mismatch. Required: ${requiredRole}, User Role: ${user?.role}`);
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;