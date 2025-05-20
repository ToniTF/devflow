import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <h1>Bienvenido a DevFlow</h1>
            <p>Un gestor de proyectos para desarrolladores.</p>
            <Link to="/dashboard" className="btn">Ir al Dashboard</Link>
        </div>
    );
};

export default Home;