import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';
import NotificationBell from '../Notifications/NotificationBell';
import ThemeToggle from './ThemeToggle'; // Importar el componente

// Opcional: si usas iconos de una librería, impórtalos. Ej: import { FaBars } from 'react-icons/fa';

// Navbar ahora recibe onToggleSidebar como prop
const Navbar = ({ onToggleSidebar }) => {
    const { currentUser } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <div className="navbar-left-section"> {/* Contenedor para hamburguesa y logo */}
                <button
                    className="mobile-sidebar-toggle"
                    onClick={onToggleSidebar} // Llama a la función pasada desde App.jsx
                    aria-label="Abrir menú lateral"
                    aria-expanded={false} // Podrías pasar el estado isMobileSidebarOpen aquí también si quieres ser más preciso
                >
                    {/* Icono de hamburguesa con spans (CSS se encarga de esto) */}
                    <span></span>
                    <span></span>
                    <span></span>
                    {/* Alternativa con react-icons: <FaBars /> */}
                </button>
                <div className="navbar-logo">
                    <Link to="/">
                        <h1 id="app_name">DevFlow</h1>
                    </Link>
                </div>
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
                        <ThemeToggle /> {/* Añadir el botón de cambio de tema */}
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