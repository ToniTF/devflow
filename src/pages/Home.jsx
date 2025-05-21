import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="hero-title">
          <span className="highlight">DevFlow</span> - Colaboración sin límites
        </h1>
        <p className="hero-description">
          Una plataforma integral para gestionar tus proyectos de desarrollo.
          Colabora con otros desarrolladores, asigna tareas, comparte archivos
          y comunícate en tiempo real. Diseñado por desarrolladores, para desarrolladores.
        </p>
        <div className="hero-buttons">
          <Link to="/dashboard" className="btn btn-primary">
            <i className="fas fa-rocket"></i> Explorar Proyectos
          </Link>
          <Link to="/project/new" className="btn btn-secondary">
            Crear Proyecto
          </Link>
        </div>
      </section>

      {/* Resto de secciones */}
    </div>
  );
};

export default Home;