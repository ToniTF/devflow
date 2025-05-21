import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';
import NotificationBell from '../Notifications/NotificationBell';

const Navbar = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">
                    <h1 id="app_name">DevFlow</h1>
                </Link>
            </div>
            
            <div className="navbar-links">
                                
                {currentUser ? (
                    <>
                        <Link to="/dashboard" className="nav-link">
                            Proyectos
                        </Link>
                        <Link to="/contacts" className="nav-link">
                            Contactos
                        </Link>
                        <NotificationBell />
                        <Link to="/profile" className="user-menu-link">
                            <div className="user-menu">
                                <img 
                                    src={currentUser.photoURL || 'https://via.placeholder.com/35'} 
                                    alt="Avatar" 
                                    className="user-avatar" 
                                />
                            </div>
                        </Link>
                    </>
                ) : (
                    <Link to="/login" className="nav-link auth-button">
                        Acceder con GitHub
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;