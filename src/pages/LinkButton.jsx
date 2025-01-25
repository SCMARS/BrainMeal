import React from "react";
import { useNavigate } from "react-router-dom";

const LinkButton = ({ to, children }) => {
    const navigate = useNavigate();
    const handleClick = () => {
        window.open(to, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="download-button" onClick={handleClick}>
            {children}
        </button>
    );
};

export default LinkButton;
