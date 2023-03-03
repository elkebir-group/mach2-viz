import React from 'react';
import { useState } from "react";

function Legend(props) {
    var hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

    const colorPalette = [
        "#a6cee3",
        "#1f78b4",
        "#b2df8a",
        "#33a02c",
        "#fb9a99",
        "#e31a1c",
        "#fdbf6f",
        "#ff7f00",
        "#cab2d6",
        "#6a3d9a",
        "#ffff99",
        "#b15928"
    ]

    return <ul>
        {props.coloring.map((l) => 
            <li className="legendtext" style={{color: hexColorRegex.test(l[1]) ? l[1] : colorPalette[parseInt(l[1])], liststyle: "circle"}}>
                <p style={{color: "black"}}>{l[0]}</p>
            </li>)}
    </ul>
}

export default Legend;