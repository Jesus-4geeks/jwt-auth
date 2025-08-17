import React, { useEffect } from "react"
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}
	}

	const handleLogout = () => {
		dispatch({ type: "logout" });
	};

	useEffect(() => {
		loadMessage()
	}, [])

	return (
		<div className="container mt-5">
			<h1 className="text-center mb-4">JWT Authentication Demo</h1>
			
			{/* Backend Message */}
			<div className="alert alert-info text-center">
				{store.message ? (
					<span>{store.message}</span>
				) : (
					<span className="text-danger">
						Loading message from the backend...
					</span>
				)}
			</div>

			{/* Authentication Status */}
			<div className="row justify-content-center mt-5">
				<div className="col-md-8">
					{store.isAuthenticated ? (
						// Authenticated view
						<div className="card">
							<div className="card-header bg-success text-white">
								<h5 className="mb-0">Welcome back!</h5>
							</div>
							<div className="card-body">
								<h6 className="card-title">
									Hello, {store.user?.first_name || store.user?.email}!
								</h6>
								<p className="card-text">
									You are successfully logged in. You can now access protected areas of the application.
								</p>
								<div className="text-center">
									<Link to="/profile" className="btn btn-primary me-2">
										My Profile
									</Link>
									<Link to="/private" className="btn btn-success me-2">
										Private Area
									</Link>
									<button 
										className="btn btn-danger" 
										onClick={handleLogout}
									>
										Logout
									</button>
								</div>
							</div>
						</div>
					) : (
						// Non-authenticated view
						<div className="card">
							<div className="card-header bg-primary text-white">
								<h5 className="mb-0">Authentication Required</h5>
							</div>
							<div className="card-body">
								<h6 className="card-title">Get Started</h6>
								<p className="card-text">
									Sign up for a new account or log in to access protected features and your personal dashboard.
								</p>
								<div className="text-center">
									<Link to="/signup" className="btn btn-primary me-2">
										Sign Up
									</Link>
									<Link to="/login" className="btn btn-outline-primary">
										Log In
									</Link>
								</div>
								
								{/* Test Credentials */}
								<div className="mt-4 p-3 bg-light rounded text-center">
									<small className="text-muted">
										<strong>Test Credentials:</strong><br />
										Email: john@example.com<br />
										Password: 123456
									</small>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Features Overview */}
			<div className="row mt-5">
				<div className="col-md-4">
					<div className="card h-100">
						<div className="card-body">
							<h5 className="card-title">Secure Authentication</h5>
							<p className="card-text">
								JWT-based authentication with secure password hashing and token management.
							</p>
						</div>
					</div>
				</div>
				<div className="col-md-4">
					<div className="card h-100">
						<div className="card-body">
							<h5 className="card-title">User Profiles</h5>
							<p className="card-text">
								Complete user management with profile editing and password change functionality.
							</p>
						</div>
					</div>
				</div>
				<div className="col-md-4">
					<div className="card h-100">
						<div className="card-body">
							<h5 className="card-title">Protected Routes</h5>
							<p className="card-text">
								Automatic route protection with redirect to login for unauthorized access.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};