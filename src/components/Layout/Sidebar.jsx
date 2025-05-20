import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { currentUser } = useContext(AuthContext);

    // Determina si un enlace está activo
    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar">
            <h2>DevFlow</h2>
            <ul>
                <li>
                    <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                        <span className="sidebar-icon">📊</span>
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/projects" className={isActive('/projects') ? 'active' : ''}>
                        <span className="sidebar-icon">📁</span>
                        Proyectos
                    </Link>
                </li>
                {currentUser && (
                    <li>
                        <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
                            <span className="sidebar-icon">👤</span>
                            Mi Perfil
                        </Link>
                    </li>
                )}
                <li>
                    <Link to="/" className={isActive('/') ? 'active' : ''}>
                        <span className="sidebar-icon">🏠</span>
                        Inicio
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;