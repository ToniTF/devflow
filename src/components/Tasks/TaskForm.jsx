import React, { useState, useEffect } from 'react';
import './TaskForm.css';

const TaskForm = ({ task, onSubmit, collaborators, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inicializar formulario si estamos editando
  useEffect(() => {
    if (task) {
      let initialDueDate = '';
      if (task.dueDate) {
        // Comprobar si es un objeto Timestamp de Firebase
        if (typeof task.dueDate.toDate === 'function') {
          try {
            // Convertir Timestamp a objeto Date y luego a formato YYYY-MM-DD
            initialDueDate = task.dueDate.toDate().toISOString().split('T')[0];
          } catch (e) {
            console.error("Error al formatear dueDate desde Timestamp:", e, task.dueDate);
            // initialDueDate permanece como '' si hay error
          }
        } else {
          // Si task.dueDate existe pero no es un Timestamp (ej. ya es una cadena o Date obj)
          // Esto es un fallback, ya que idealmente siempre debería ser un Timestamp si viene de Firestore.
          try {
            const dateObj = new Date(task.dueDate);
            // Comprobar si la fecha resultante es válida antes de formatear
            if (!isNaN(dateObj.getTime())) {
              initialDueDate = dateObj.toISOString().split('T')[0];
            } else {
              console.warn("task.dueDate no es un Timestamp y no se pudo convertir a fecha válida:", task.dueDate);
            }
          } catch (e) {
            console.error("Error al formatear dueDate (no Timestamp):", e, task.dueDate);
            // initialDueDate permanece como '' si hay error
          }
        }
      }

      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo || '', // Para un select simple, esto está bien.
        dueDate: initialDueDate,
        priority: task.priority || 'medium'
      });
    } else {
      // Modo creación: resetear formulario a valores iniciales
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium'
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validación básica
      if (!formData.title.trim()) {
        throw new Error('El título de la tarea es obligatorio');
      }

      const taskData = {
        ...formData,
        title: formData.title.trim()
      };

      // Si hay fecha, convertir a objeto Date
      if (formData.dueDate) {
        taskData.dueDate = new Date(formData.dueDate);
      }

      // Aquí está el error: llamamos a onSubmit con el ID de la tarea solo si estamos editando
      // Si estamos creando una nueva tarea, solo pasamos los datos
      const success = task 
        ? await onSubmit(task.id, taskData)  // Para edición
        : await onSubmit(taskData);          // Para creación

      if (success) {
        // Limpiar formulario si no estamos editando
        if (!task) {
          setFormData({
            title: '',
            description: '',
            assignedTo: '',
            dueDate: '',
            priority: 'medium'
          });
        }
      }
    } catch (err) {
      console.error("Error al guardar tarea:", err);
      setError(err.message || 'No se pudo guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <h3>{task ? 'Editar tarea' : 'Nueva tarea'}</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Título*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="assignedTo">Asignar a</label>
          <select
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
          >
            <option value="">Sin asignar</option>
            {Object.entries(collaborators).map(([id, user]) => (
              <option key={id} value={id}>
                {user.displayName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Fecha límite</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">Prioridad</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : task ? 'Actualizar tarea' : 'Crear tarea'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;