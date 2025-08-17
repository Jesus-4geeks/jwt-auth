import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();

	const handleLogout = () => {
		// Dispatch logout action
		dispatch({ type: "logout" });
	};

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">JWT Authentication App</span>
				</Link>
				<div className="ml-auto d-flex gap-2">
					{store.isAuthenticated ? (
						// Authenticated user menu
						<>
							<span className="navbar-text me-3">
								Welcome, {store.user?.first_name || store.user?.email}!
							</span>
							<Link to="/profile">
								<button className="btn btn-outline-primary btn-sm me-2">Profile</button>
							</Link>
							<Link to="/private">
								<button className="btn btn-outline-secondary btn-sm me-2">Private</button>
							</Link>
							<button 
								className="btn btn-outline-danger btn-sm" 
								onClick={handleLogout}
							>
								Logout
							</button>
						</>
					) : (
						// Non-authenticated user menu
						<>
							<Link to="/login">
								<button className="btn btn-primary btn-sm me-2">Login</button>
							</Link>
							<Link to="/signup">
								<button className="btn btn-outline-primary btn-sm">Sign Up</button>
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};