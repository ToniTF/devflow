import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  getProjectTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  assignTask, 
  changeTaskStatus 
} from '../../firebase/tasks';
import { getUserById } from '../../firebase/firestore';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import './TaskManager.css';

const TaskManager = ({ projectId, collaborators, isOwner }) => {
  const { currentUser } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [collaboratorsData, setCollaboratorsData] = useState({});
  const [filter, setFilter] = useState('all');
  
  // Cargar tareas
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksList = await getProjectTasks(projectId);
        setTasks(tasksList);
        setError(null);
      } catch (err) {
        console.error('Error al cargar tareas:', err);
        setError('No se pudieron cargar las tareas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [projectId]);
  
  // Cargar datos de colaboradores
  useEffect(() => {
    const loadCollaborators = async () => {
      if (!collaborators || collaborators.length === 0) return;
      
      try {
        const collaboratorsInfo = {};
        for (const userId of collaborators) {
          collaboratorsInfo[userId] = await getUserById(userId);
        }
        setCollaboratorsData(collaboratorsInfo);
      } catch (err) {
        console.error('Error al cargar datos de colaboradores:', err);
      }
    };
    
    loadCollaborators();
  }, [collaborators]);
  
  // Funciones para gestionar tareas
  const handleCreateTask = async (taskData) => {
    try {
      console.log("Creando nueva tarea:", taskData); // Agregar log para depuración
      
      const newTask = await createTask(projectId, {
        ...taskData,
        status: 'pending',
        createdBy: currentUser.uid,
        assignedTo: taskData.assignedTo || null
      });
      
      console.log("Tarea creada:", newTask); // Log para confirmar creación
      
      // Actualizar el estado local para mostrar la nueva tarea
      setTasks(prev => [newTask, ...prev]);
      setShowForm(false);
      return true;
    } catch (err) {
      console.error('Error al crear tarea:', err);
      return false;
    }
  };
  
  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await updateTask(projectId, taskId, taskData);
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...taskData } : task
      ));
      
      setEditingTask(null);
      return true;
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      return false;
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(projectId, taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return true;
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      return false;
    }
  };
  
  const handleAssignTask = async (taskId, userId) => {
    try {
      await assignTask(projectId, taskId, userId);
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, assignedTo: userId } : task
      ));
      
      return true;
    } catch (err) {
      console.error('Error al asignar tarea:', err);
      return false;
    }
  };
  
  const handleStatusChange = async (taskId, status) => {
    try {
      await changeTaskStatus(projectId, taskId, status);
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
      
      return true;
    } catch (err) {
      console.error('Error al cambiar estado de tarea:', err);
      return false;
    }
  };

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'my-tasks') return task.assignedTo === currentUser?.uid;
    if (filter === 'unassigned') return !task.assignedTo;
    return task.status === filter; // Para filtros por estado (pending, in-progress, completed)
  });
  
  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <h2>Tareas del proyecto</h2>
        {(isOwner || collaborators?.includes(currentUser?.uid)) && (
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingTask(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancelar' : 'Nueva tarea'}
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="task-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
        <button 
          className={filter === 'my-tasks' ? 'active' : ''}
          onClick={() => setFilter('my-tasks')}
        >
          Mis tareas
        </button>
        <button 
          className={filter === 'unassigned' ? 'active' : ''}
          onClick={() => setFilter('unassigned')}
        >
          Sin asignar
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </button>
        <button 
          className={filter === 'in-progress' ? 'active' : ''}
          onClick={() => setFilter('in-progress')}
        >
          En progreso
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completadas
        </button>
      </div>

      {/* Formulario para crear/editar tarea */}
      {showForm && (
        <TaskForm 
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          collaborators={collaboratorsData}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
      
      {/* Lista de tareas */}
      {loading ? (
        <div className="loading">Cargando tareas...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredTasks.length > 0 ? (
        <TaskList 
          tasks={filteredTasks}
          collaboratorsData={collaboratorsData}
          currentUser={currentUser}
          isOwner={isOwner}
          onEdit={(task) => {
            setEditingTask(task);
            setShowForm(true);
          }}
          onDelete={handleDeleteTask}
          onAssign={handleAssignTask}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="no-tasks-message">
          No hay tareas {filter !== 'all' ? 'que coincidan con este filtro' : 'para este proyecto'}.
        </div>
      )}
    </div>
  );
};

export default TaskManager;