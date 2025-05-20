import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Assuming you have a CSS file for styling

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">DevFlow</Link>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/projects">Projects</Link>
                </li>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/profile">Profile</Link>
                </li>
            </ul>
            <div className="navbar-auth">
                <Link to="/login">Login</Link>
            </div>
        </nav>
    );
};

export default Navbar;