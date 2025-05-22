import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Sidebar.css';

// Sidebar ahora recibe isMobileOpen y onLinkClick como props
const Sidebar = ({ isMobileOpen, onLinkClick }) => {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);

  // Función para manejar el clic en un enlace
  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick(); // Llama a la función pasada desde App.jsx
    }
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'active' : ''}`}>
      <h2>Menú</h2>
      <ul>
        {/* Enlaces siempre visibles */}
        <li>
          <NavLink exact to="/" activeClassName="active" onClick={handleLinkClick}>
            <i className="fas fa-home sidebar-icon"></i> Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" activeClassName="active" onClick={handleLinkClick}>
            <i className="fas fa-th-large sidebar-icon"></i> Proyectos
          </NavLink>
        </li>

        {/* Enlaces condicionales basados en el estado de autenticación */}
        {!currentUser ? (
          <li>
            <NavLink to="/login" activeClassName="active" onClick={handleLinkClick}>
              <i className="fas fa-sign-in-alt sidebar-icon"></i> Login
            </NavLink>
          </li>
        ) : (
          <>
            <li>
              <NavLink to="/my-projects" activeClassName="active" onClick={handleLinkClick}>
                <i className="fas fa-folder sidebar-icon"></i> Mis Proyectos
              </NavLink>
            </li>
            <li>
              <NavLink to="/contacts" activeClassName="active" onClick={handleLinkClick}>
                <i className="fas fa-address-book sidebar-icon"></i> Contactos
              </NavLink>
            </li>
            <li>
              <NavLink to="/notifications" activeClassName="active" onClick={handleLinkClick}>
                <i className="fas fa-bell sidebar-icon"></i> Notificaciones
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" activeClassName="active" onClick={handleLinkClick}>
                <i className="fas fa-user sidebar-icon"></i> Perfil
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendar" activeClassName="active" onClick={handleLinkClick}>
                <i className="fas fa-calendar-alt sidebar-icon"></i> Calendario
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;