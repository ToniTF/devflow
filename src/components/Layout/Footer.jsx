import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} DevFlow. Todos los derechos reservados.</p>
                <p>
                    <a href="/privacy-policy">Política de privacidad</a> | 
                    <a href="/terms-of-service"> Términos de servicio</a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;