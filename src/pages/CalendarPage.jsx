import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getUserTasks } from '../firebase/tasks';
import './CalendarPage.css';

// Configurar el localizador para el calendario
moment.locale('es');
const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const loadUserTasks = async () => {
      try {
        setLoading(true);
        const userTasks = await getUserTasks(currentUser.uid);
        
        // Transformar las tareas al formato que espera el calendario
        const calendarEvents = userTasks.map(task => ({
          id: task.id,
          title: task.title,
          start: task.deadline ? new Date(task.deadline.seconds * 1000) : new Date(),
          end: task.deadline ? new Date(task.deadline.seconds * 1000) : new Date(),
          allDay: true,
          resource: task // Guardar toda la información de la tarea
        }));
        
        setTasks(calendarEvents);
      } catch (error) {
        console.error('Error al cargar las tareas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserTasks();
  }, [currentUser]);

  // Manejar eventos del calendario
  const handleSelectEvent = (event) => {
    setSelectedTask(event.resource);
  };

  // Personalizar el evento en el calendario
  const eventStyleGetter = (event) => {
    const isCompleted = event.resource?.status === 'completed';
    const isPastDue = event.start < new Date() && event.resource?.status !== 'completed';
    
    let style = {
      backgroundColor: '#3174ad',
      borderRadius: '4px',
      color: 'white',
      border: '0px',
      display: 'block'
    };
    
    if (isCompleted) {
      style.backgroundColor = '#4caf50'; // Verde para tareas completadas
    } else if (isPastDue) {
      style.backgroundColor = '#f44336'; // Rojo para tareas vencidas
    } else if (moment(event.start).isSame(new Date(), 'day')) {
      style.backgroundColor = '#ff9800'; // Naranja para tareas de hoy
    }
    
    return {
      style
    };
  };

  return (
    <div className="calendar-page">
      <h1>Calendario de Tareas</h1>
      
      {loading ? (
        <div className="loading-spinner">Cargando tareas...</div>
      ) : (
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={tasks}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            views={['month', 'week', 'day']}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día"
            }}
          />
          
          {selectedTask && (
            <div className="task-details">
              <h3>{selectedTask.title}</h3>
              <p className="task-description">
                {selectedTask.description || 'Sin descripción'}
              </p>
              <div className="task-meta">
                <span className={`task-status status-${selectedTask.status}`}>
                  {selectedTask.status === 'completed' ? 'Completada' : 
                   selectedTask.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                </span>
                {selectedTask.priority && (
                  <span className={`task-priority priority-${selectedTask.priority}`}>
                    Prioridad: {selectedTask.priority === 'high' ? 'Alta' : 
                              selectedTask.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                )}
              </div>
              
              <button 
                className="view-task-btn"
                onClick={() => window.location.href = `/project/${selectedTask.projectId}?task=${selectedTask.id}`}
              >
                Ver detalle
              </button>
              
              <button 
                className="close-details-btn"
                onClick={() => setSelectedTask(null)}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;