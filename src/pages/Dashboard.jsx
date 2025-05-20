import React from 'react';
import { useProjects } from '../hooks/useProjects';
import ProjectList from '../components/Projects/ProjectList';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';

const Dashboard = () => {
    const { projects } = useProjects();

    return (
        <div className="dashboard">
            <Navbar />
            <div className="dashboard-content">
                <Sidebar />
                <main>
                    <h1>Dashboard</h1>
                    <ProjectList projects={projects} />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;