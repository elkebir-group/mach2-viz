import React, { useState, useEffect } from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

import icon from "../assets/logo.png";

function Loading(props) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (props.progress / 100) * circumference;

    return <div className="loading">
        <img src={icon} alt="Icon" width="500px"/>
        <h1>Loading...</h1>
        <svg>
            <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#006699"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            />
        </svg>
    </div>
}

export default Loading;