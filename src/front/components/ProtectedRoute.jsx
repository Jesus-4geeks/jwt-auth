import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';

export const ProtectedRoute = ({ children }) => {
    const { store, dispatch } = useGlobalReducer();
    const location = useLocation();

    useEffect(() => {
        // Check if there's a token in sessionStorage but not in store
        const token = sessionStorage.getItem('token');
        const user = JSON.parse(sessionStorage.getItem('user') || 'null');
        
        if (token && user && !store.isAuthenticated) {
            // Restore authentication state from sessionStorage
            dispatch({
                type: 'login_success',
                payload: { token, user }
            });
        }
    }, [store.isAuthenticated, dispatch]);

    // If not authenticated, redirect to login with return path
    if (!store.isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the protected component
    return children;
};