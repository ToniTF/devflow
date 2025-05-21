import React, { useContext, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(false);

  // Determina si un enlace está activo
  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${isMobile ? 'active' : ''}`}>
      <ul>
        <li>
          <NavLink exact to="/" activeClassName="active">
            <i className="fas fa-home sidebar-icon"></i> Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" activeClassName="active">
            <i className="fas fa-th-large sidebar-icon"></i> Proyectos
          </NavLink>
        </li>
        {currentUser && (
          <>
            <li>
              <NavLink to="/my-projects" activeClassName="active">
                <i className="fas fa-folder sidebar-icon"></i> Mis Proyectos
              </NavLink>
            </li>
            <li>
              <NavLink to="/contacts" activeClassName="active">
                <i className="fas fa-address-book sidebar-icon"></i> Contactos
              </NavLink>
            </li>
            <li>
              <NavLink to="/notifications" activeClassName="active">
                <i className="fas fa-bell sidebar-icon"></i> Notificaciones
                {/* Puedes añadir badge de notificaciones aquí */}
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" activeClassName="active">
                <i className="fas fa-user sidebar-icon"></i> Perfil
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;