import React from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = ({ 
  tasks, 
  collaboratorsData, 
  currentUser, 
  isOwner, 
  onEdit, 
  onDelete, 
  onAssign, 
  onStatusChange 
}) => {
  
  // Agrupar tareas por estado
  const groupedTasks = {
    pending: tasks.filter(task => task.status === 'pending' || !task.status),
    inProgress: tasks.filter(task => task.status === 'in-progress'),
    completed: tasks.filter(task => task.status === 'completed')
  };
  
  return (
    <div className="tasks-board">
      <div className="tasks-column">
        <div className="column-header pending">
          <h3>Pendientes</h3>
          <span className="task-count">{groupedTasks.pending.length}</span>
        </div>
        <div className="tasks-list">
          {groupedTasks.pending.length > 0 ? (
            groupedTasks.pending.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                collaboratorsData={collaboratorsData}
                currentUser={currentUser}
                isOwner={isOwner}
                canEdit={isOwner || task.createdBy === currentUser?.uid || task.assignedTo === currentUser?.uid}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task.id)}
                onAssign={onAssign}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <div className="empty-column">No hay tareas pendientes</div>
          )}
        </div>
      </div>
      
      <div className="tasks-column">
        <div className="column-header in-progress">
          <h3>En progreso</h3>
          <span className="task-count">{groupedTasks.inProgress.length}</span>
        </div>
        <div className="tasks-list">
          {groupedTasks.inProgress.length > 0 ? (
            groupedTasks.inProgress.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                collaboratorsData={collaboratorsData}
                currentUser={currentUser}
                isOwner={isOwner}
                canEdit={isOwner || task.createdBy === currentUser?.uid || task.assignedTo === currentUser?.uid}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task.id)}
                onAssign={onAssign}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <div className="empty-column">No hay tareas en progreso</div>
          )}
        </div>
      </div>
      
      <div className="tasks-column">
        <div className="column-header completed">
          <h3>Completadas</h3>
          <span className="task-count">{groupedTasks.completed.length}</span>
        </div>
        <div className="tasks-list">
          {groupedTasks.completed.length > 0 ? (
            groupedTasks.completed.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                collaboratorsData={collaboratorsData}
                currentUser={currentUser}
                isOwner={isOwner}
                canEdit={isOwner || task.createdBy === currentUser?.uid || task.assignedTo === currentUser?.uid}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task.id)}
                onAssign={onAssign}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <div className="empty-column">No hay tareas completadas</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;