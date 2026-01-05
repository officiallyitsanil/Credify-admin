import React from 'react';
import './Card.css';

const Card = ({ children, title, action, className = '' }) => {
    return (
        <div className={`custom-card ${className}`}>
            {(title || action) && (
                <div className="custom-card-header">
                    {title && <h3 className="custom-card-title">{title}</h3>}
                    {action && <div className="custom-card-action">{action}</div>}
                </div>
            )}
            <div className="custom-card-body">
                {children}
            </div>
        </div>
    );
};

export default Card;
