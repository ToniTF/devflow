import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ onClick, children, type = 'button', className = '' }) => {
    return (
        <button onClick={onClick} type={type} className={`btn ${className}`}>
            {children}
        </button>
    );
};

Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    type: PropTypes.string,
    className: PropTypes.string,
};

export default Button;