import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
import NewProject from './pages/NewProject'; // Añadir esta importación
import EditProject from './pages/EditProject';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import NotificationsPage from './pages/NotificationsPage'; // Añadir esta importación
import './styles.css';

const App = () => {
    return (
        <AuthProvider>
            <ProjectProvider>
                <Router>
                    <Navbar />
                    <div className="app-container">
                        <Sidebar />
                        <main className="main-content">
                            <Switch>
                                <Route path="/" exact component={Home} />
                                <Route path="/dashboard" component={Dashboard} />
                                <Route path="/project/new" component={NewProject} />
                                <Route path="/project/edit/:id" component={EditProject} /> {/* Añadir esta ruta */}
                                <Route path="/project/:id" component={ProjectPage} />
                                <Route path="/profile" component={Profile} />
                                <Route path="/login" component={Login} />
                                <Route path="/notifications" component={NotificationsPage} /> {/* Añadir esta ruta */}
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