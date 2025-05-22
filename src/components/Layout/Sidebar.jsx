import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Sidebar.css';

// Sidebar ahora recibe isMobileOpen como prop
const Sidebar = ({ isMobileOpen }) => {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);

  return (
    // Usar la prop isMobileOpen para la clase 'active'
    <aside className={`sidebar ${isMobileOpen ? 'active' : ''}`}>
      <h2>Menú</h2> {/* Considera añadir un título o logo aquí también si es apropiado */}
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
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" activeClassName="active">
                <i className="fas fa-user sidebar-icon"></i> Perfil
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendar" activeClassName="active">
                <i className="fas fa-calendar-alt sidebar-icon"></i> Calendario
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside> // Cambiado de div a aside por semántica
  );
};

export default Sidebar;