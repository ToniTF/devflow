import React, { useState } from 'react';
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
  const [showActions, setShowActions] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  
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
    setShowActions(false);
  };
  
  // Gestionar asignación
  const handleAssign = async (userId) => {
    await onAssign(task.id, userId);
    setShowAssignMenu(false);
  };

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
      
      <div className="task-actions">
        {canEdit && (
          <button 
            className="btn btn-sm btn-edit" 
            onClick={onEdit}
            title="Editar tarea"
          >
            Editar
          </button>
        )}
        
        {(isOwner || task.assignedTo === currentUser?.uid) && (
          <>
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-status"
                onClick={() => setShowActions(!showActions)}
                title="Cambiar estado"
              >
                Estado ▼
              </button>
              
              {showActions && (
                <div className="dropdown-menu">
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
            
            {isOwner && (
              <div className="dropdown">
                <button 
                  className="btn btn-sm btn-assign"
                  onClick={() => setShowAssignMenu(!showAssignMenu)}
                  title="Asignar tarea"
                >
                  Asignar ▼
                </button>
                
                {showAssignMenu && (
                  <div className="dropdown-menu">
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
          </>
        )}
        
        {(isOwner || task.createdBy === currentUser?.uid) && (
          <button 
            className="btn btn-sm btn-delete" 
            onClick={onDelete}
            title="Eliminar tarea"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;