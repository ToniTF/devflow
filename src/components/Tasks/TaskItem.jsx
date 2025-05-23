import React, { useState, useRef, useEffect } from 'react'; // Añadir useRef y useEffect
import './TaskItem.css';

const TaskItem = ({ 
  task, 
  collaboratorsData, 
  currentUser, 
  isOwner, 
  canEdit, 
  onEdit, 
  onDelete, 
  onAssign, 
  onStatusChange 
}) => {
  const [showStatusSubMenu, setShowStatusSubMenu] = useState(false); // Renombrado desde showActions
  const [showAssignSubMenu, setShowAssignSubMenu] = useState(false); // Renombrado desde showAssignMenu
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false); // Nuevo estado para el menú principal
  
  const actionMenuRef = useRef(null); // Ref para el menú principal
  const statusSubMenuRef = useRef(null); // Ref para el submenú de estado
  const assignSubMenuRef = useRef(null); // Ref para el submenú de asignación

  // Formatear fecha límite si existe
  const formattedDueDate = task.dueDate 
    ? new Date(task.dueDate.seconds * 1000).toLocaleDateString() 
    : null;
  
  // Determinar nombre del asignado
  const assigneeName = task.assignedTo 
    ? (collaboratorsData[task.assignedTo]?.displayName || 'Usuario desconocido')
    : 'Sin asignar';
  
  // Determinar clase CSS de prioridad
  const priorityClass = `priority-${task.priority || 'medium'}`;
  
  // Gestionar cambio de estado
  const handleStatusChange = async (newStatus) => {
    await onStatusChange(task.id, newStatus);
    setShowStatusSubMenu(false); // Cerrar submenú de estado
    setIsActionMenuOpen(false); // Cerrar menú principal
  };
  
  // Gestionar asignación
  const handleAssign = async (userId) => {
    await onAssign(task.id, userId);
    setShowAssignSubMenu(false); // Cerrar submenú de asignación
    setIsActionMenuOpen(false); // Cerrar menú principal
  };

  const handleEditClick = () => {
    onEdit();
    setIsActionMenuOpen(false);
  };

  const handleDeleteClick = () => {
    onDelete();
    setIsActionMenuOpen(false);
  };

  // Cerrar menús al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setIsActionMenuOpen(false);
      }
      // Si los submenús están dentro del actionMenuRef, no se necesita lógica separada para ellos aquí
      // Pero si se posicionan fuera, sí. Por ahora, asumimos que están contenidos o se manejan por su propio botón.
      // Para simplicidad, cerramos todo si se hace clic fuera del menú principal.
      if (isActionMenuOpen) { // Solo si el menú principal está abierto
        if (statusSubMenuRef.current && !statusSubMenuRef.current.contains(event.target) && !actionMenuRef.current.contains(event.target)) {
            setShowStatusSubMenu(false);
        }
        if (assignSubMenuRef.current && !assignSubMenuRef.current.contains(event.target) && !actionMenuRef.current.contains(event.target)) {
            setShowAssignSubMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionMenuOpen]);


  return (
    <div className={`task-item ${task.status || 'pending'}`}>
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <span className={`task-priority ${priorityClass}`}>
          {task.priority === 'high' ? 'Alta' : 
           task.priority === 'low' ? 'Baja' : 'Media'}
        </span>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      <div className="task-meta">
        {formattedDueDate && (
          <div className="task-due-date">
            <span className="meta-label">Fecha límite:</span> {formattedDueDate}
          </div>
        )}
        
        <div className="task-assignee">
          <span className="meta-label">Asignada a:</span> {assigneeName}
        </div>
      </div>
      
      {/* Contenedor del menú de tres puntos y el dropdown */}
      <div className="task-kebab-menu-container" ref={actionMenuRef}>
        <button 
          className="task-kebab-menu-btn"
          onClick={() => {
            setIsActionMenuOpen(!isActionMenuOpen);
            setShowStatusSubMenu(false); // Cerrar submenús al abrir/cerrar principal
            setShowAssignSubMenu(false);
          }}
          title="Acciones de tarea"
        >
          ⋮ {/* Icono de tres puntos verticales */}
        </button>

        {isActionMenuOpen && (
          <div className="task-action-dropdown">
            {canEdit && (
              <button 
                className="task-action-dropdown-item" 
                onClick={handleEditClick}
              >
                Editar tarea
              </button>
            )}
            
            {(isOwner || task.assignedTo === currentUser?.uid) && (
              // Contenedor para el botón de Estado y su submenú
              <div className="task-action-dropdown-item-submenu-container" ref={statusSubMenuRef}>
                <button 
                  className="task-action-dropdown-item has-submenu"
                  onClick={() => setShowStatusSubMenu(!showStatusSubMenu)}
                >
                  Cambiar Estado {showStatusSubMenu ? '▲' : '▼'}
                </button>
                {showStatusSubMenu && (
                  <div className="dropdown-menu sub-menu"> {/* Usar clase .sub-menu para posible estilo diferente */}
                    <button 
                      className="dropdown-item" 
                      onClick={() => handleStatusChange('pending')}
                      disabled={task.status === 'pending' || !task.status}
                    >
                      Pendiente
                    </button>
                    <button 
                      className="dropdown-item" 
                      onClick={() => handleStatusChange('in-progress')}
                      disabled={task.status === 'in-progress'}
                    >
                      En progreso
                    </button>
                    <button 
                      className="dropdown-item" 
                      onClick={() => handleStatusChange('completed')}
                      disabled={task.status === 'completed'}
                    >
                      Completada
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {isOwner && (
              // Contenedor para el botón de Asignar y su submenú
              <div className="task-action-dropdown-item-submenu-container" ref={assignSubMenuRef}>
                <button 
                  className="task-action-dropdown-item has-submenu"
                  onClick={() => setShowAssignSubMenu(!showAssignSubMenu)}
                >
                  Asignar Tarea {showAssignSubMenu ? '▲' : '▼'}
                </button>
                {showAssignSubMenu && (
                  <div className="dropdown-menu sub-menu"> {/* Usar clase .sub-menu */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleAssign('')}
                      disabled={!task.assignedTo}
                    >
                      Sin asignar
                    </button>
                    {Object.entries(collaboratorsData).map(([id, user]) => (
                      <button 
                        key={id}
                        className="dropdown-item"
                        onClick={() => handleAssign(id)}
                        disabled={task.assignedTo === id}
                      >
                        {user.displayName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {(isOwner || task.createdBy === currentUser?.uid) && (
              <button 
                className="task-action-dropdown-item delete-action" 
                onClick={handleDeleteClick}
              >
                Eliminar tarea
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;