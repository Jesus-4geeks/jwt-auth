import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';

export const Private = () => {
    const { store } = useGlobalReducer();
    const [privateMessage, setPrivateMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPrivateData = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                
                // Fetch private message
                const privateResponse = await fetch(`${backendUrl}/api/private`, {
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });
                
                if (privateResponse.ok) {
                    const privateData = await privateResponse.json();
                    setPrivateMessage(privateData.message);
                }

                // Fetch all users
                const usersResponse = await fetch(`${backendUrl}/api/users`, {
                    headers: {
                        'Authorization': `Bearer ${store.token}`
                    }
                });
                
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setUsers(usersData.users || []);
                }

            } catch (error) {
                console.error('Error fetching private data:', error);
                setError('Failed to load private data');
            } finally {
                setLoading(false);
            }
        };

        if (store.token) {
            fetchPrivateData();
        }
    }, [store.token]);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading private content...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mb-4">Private Area</h1>
                    
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Welcome Section */}
                    <div className="card mb-4">
                        <div className="card-body text-center">
                            <h5 className="card-title">Welcome to the Private Area!</h5>
                            <p className="card-text">
                                {privateMessage || `Hello ${store.user?.first_name || store.user?.email}! This is a protected route that requires authentication.`}
                            </p>
                            <div className="alert alert-info">
                                <strong>Success!</strong> You have successfully authenticated and can access this private content.
                            </div>
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Your Information</h5>
                                </div>
                                <div className="card-body">
                                    <p><strong>User ID:</strong> {store.user?.id}</p>
                                    <p><strong>Email:</strong> {store.user?.email}</p>
                                    <p><strong>Name:</strong> {store.user?.first_name} {store.user?.last_name}</p>
                                    <p><strong>Status:</strong> 
                                        <span className="badge bg-success ms-2">
                                            {store.user?.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </p>
                                    <Link to="/profile" className="btn btn-primary btn-sm">
                                        Edit Profile
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Token Information</h5>
                                </div>
                                <div className="card-body">
                                    <p><strong>Token Status:</strong> 
                                        <span className="badge bg-success ms-2">Valid</span>
                                    </p>
                                    <p><strong>Token Preview:</strong></p>
                                    <code className="small">
                                        {store.token ? `${store.token.substring(0, 20)}...` : 'No token'}
                                    </code>
                                    <br />
                                    <small className="text-muted">
                                        This token is used to authenticate your API requests.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All Users Section */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">All Users ({users.length})</h5>
                            <small className="text-muted">This data is fetched from a protected API endpoint</small>
                        </div>
                        <div className="card-body">
                            {users.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Email</th>
                                                <th>Name</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        {user.first_name || user.last_name ? 
                                                            `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                                                            'Not provided'
                                                        }
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                            {user.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {user.created_at ? 
                                                            new Date(user.created_at).toLocaleDateString() : 
                                                            'Unknown'
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted">No users found.</p>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="text-center mt-4">
                        <Link to="/" className="btn btn-outline-primary">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};