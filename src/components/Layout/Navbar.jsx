import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">
                    <h1>DevFlow</h1>
                </Link>
            </div>
            
            <div className="navbar-links">
                <Link to="/dashboard" className="nav-link">
                    Proyectos
                </Link>
                
                {currentUser ? (
                    <>
                        <Link to="/dashboard" className="nav-link">
                            Dashboard
                        </Link>
                        <Link to="/profile" className="nav-link">
                            Perfil
                        </Link>
                        <div className="user-menu">
                            <img 
                                src={currentUser.photoURL || 'https://via.placeholder.com/35'} 
                                alt="Avatar" 
                                className="user-avatar" 
                            />
                        </div>
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