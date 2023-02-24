import React from 'react';
import { useState } from "react";

function Legend(props) {
    const colorPalette = [
        "#fff5ba",
        "#ffcbc1",
        "#e7ffac",
        "#85e3ff",
        "#a79aff",
        "#d5aaff",
        "#f6a6ff",
        "#aff8d8",
        "#ffc9de",
        "#ffabab"
    ]

    return <ul>
        {props.coloring.map((l) => <li className="legendtext" style={{color: colorPalette[parseInt(l[1])], liststyle: "circle"}}><p style={{color: "black"}}>{l[0]}</p></li>)}
    </ul>
}

export default Legend;