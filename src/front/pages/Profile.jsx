import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';

export const Profile = () => {
    const { store, dispatch } = useGlobalReducer();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    // Load user data when component mounts
    useEffect(() => {
        if (store.user) {
            setProfileData({
                first_name: store.user.first_name || '',
                last_name: store.user.last_name || '',
                email: store.user.email || ''
            });
        }
    }, [store.user]);

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            
            const response = await fetch(`${backendUrl}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${store.token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (response.ok) {
                // Update user in store
                dispatch({
                    type: 'update_user',
                    payload: data.user
                });
                setSuccess('Profile updated successfully!');
                setEditing(false);
            } else {
                // Handle specific errors
                if (response.status === 401 || data.error === 'token_expired' || data.error === 'invalid_token') {
                    // Token is invalid or expired, logout user
                    dispatch({ type: 'logout' });
                    setError('Your session has expired. Please log in again.');
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else {
                    setError(data.message || 'Failed to update profile');
                }
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setError('An error occurred while updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.new_password.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            
            const response = await fetch(`${backendUrl}/api/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${store.token}`
                },
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Password changed successfully!');
                setChangingPassword(false);
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            } else {
                setError(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Password change error:', error);
            setError('An error occurred while changing password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <h2 className="mb-4">My Profile</h2>
                    
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success" role="alert">
                            {success}
                        </div>
                    )}

                    {/* Profile Information Card */}
                    <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Profile Information</h5>
                            {!editing && (
                                <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => setEditing(true)}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {editing ? (
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="first_name" className="form-label">First Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="first_name"
                                                name="first_name"
                                                value={profileData.first_name}
                                                onChange={handleProfileChange}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="last_name" className="form-label">Last Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="last_name"
                                                name="last_name"
                                                value={profileData.last_name}
                                                onChange={handleProfileChange}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setEditing(false);
                                                setError('');
                                                setSuccess('');
                                                // Reset form
                                                setProfileData({
                                                    first_name: store.user?.first_name || '',
                                                    last_name: store.user?.last_name || '',
                                                    email: store.user?.email || ''
                                                });
                                            }}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>First Name:</strong>
                                            <p className="mb-0">{store.user?.first_name || 'Not provided'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Last Name:</strong>
                                            <p className="mb-0">{store.user?.last_name || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Email:</strong>
                                        <p className="mb-0">{store.user?.email}</p>
                                    </div>
                                    <div className="mb-0">
                                        <strong>Member Since:</strong>
                                        <p className="mb-0">
                                            {store.user?.created_at ? 
                                                new Date(store.user.created_at).toLocaleDateString() : 
                                                'Unknown'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Change Password</h5>
                            {!changingPassword && (
                                <button 
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => setChangingPassword(true)}
                                >
                                    Change Password
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {changingPassword ? (
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="current_password" className="form-label">Current Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="current_password"
                                            name="current_password"
                                            value={passwordData.current_password}
                                            onChange={handlePasswordChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="new_password" className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="new_password"
                                            name="new_password"
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength="6"
                                            disabled={loading}
                                        />
                                        <div className="form-text">Password must be at least 6 characters long.</div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirm_password" className="form-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirm_password"
                                            name="confirm_password"
                                            value={passwordData.confirm_password}
                                            onChange={handlePasswordChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button 
                                            type="submit" 
                                            className="btn btn-warning"
                                            disabled={loading}
                                        >
                                            {loading ? 'Changing...' : 'Change Password'}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setChangingPassword(false);
                                                setError('');
                                                setSuccess('');
                                                setPasswordData({
                                                    current_password: '',
                                                    new_password: '',
                                                    confirm_password: ''
                                                });
                                            }}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <p className="text-muted mb-0">
                                    Click "Change Password" to update your password securely.
                                </p>
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