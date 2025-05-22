import React, { useState } from 'react'; // Importar useState
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
import NewProject from './pages/NewProject';
import EditProject from './pages/EditProject';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import NotificationsPage from './pages/NotificationsPage';
import MyProjectsPage from './pages/MyProjectsPage';
import ContactsPage from './pages/ContactsPage';
import CalendarPage from './pages/CalendarPage';
import './styles.css';

const App = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    // Nueva función para cerrar el sidebar móvil
    const closeMobileSidebar = () => {
        if (isMobileSidebarOpen) { // Solo cierra si está abierto
            setIsMobileSidebarOpen(false);
        }
    };

    return (
        <AuthProvider>
            <ProjectProvider>
                <Router>
                    <Navbar onToggleSidebar={toggleMobileSidebar} />
                    <div className="app-container">
                        {/* Pasar la función closeMobileSidebar al Sidebar */}
                        <Sidebar 
                            isMobileOpen={isMobileSidebarOpen} 
                            onLinkClick={closeMobileSidebar} // Nueva prop
                        />
                        <main className="main-content">
                            <Switch>
                                <Route path="/" exact component={Home} />
                                <Route path="/dashboard" component={Dashboard} />
                                <Route path="/my-projects" component={MyProjectsPage} />
                                <Route path="/contacts" component={ContactsPage} />
                                <Route path="/calendar" component={CalendarPage} />
                                <Route path="/project/new" component={NewProject} />
                                <Route path="/project/edit/:id" component={EditProject} />
                                <Route path="/project/:id" component={ProjectPage} />
                                <Route path="/profile" component={Profile} />
                                <Route path="/login" component={Login} />
                                <Route path="/notifications" component={NotificationsPage} />
                            </Switch>
                        </main>
                    </div>
                    <Footer />
                </Router>
            </ProjectProvider>
        </AuthProvider>
    );
};

export default App;