import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
import Profile from './pages/Profile';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import './styles.css';

const App = () => {
    return (
        <AuthProvider>
            <ProjectProvider>
                <Router>
                    <Navbar />
                    <Sidebar />
                    <Switch>
                        <Route path="/" exact component={Home} />
                        <Route path="/dashboard" component={Dashboard} />
                        <Route path="/project/:id" component={ProjectPage} />
                        <Route path="/profile" component={Profile} />
                    </Switch>
                    <Footer />
                </Router>
            </ProjectProvider>
        </AuthProvider>
    );
};

export default App;