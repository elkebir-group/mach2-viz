import React from 'react';
import { useState, useEffect, useRef } from "react";
import map from '../assets/map.jpeg';

function Legend(props) {
    var hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

    let fetchColor = (label) => {
        let ret = 0;
        props.coloring.forEach(l => {
            if (l[0] === label) {
                ret = l[1];
            }
        })
        return ret;
    }

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
    const ncolors = colorPalette.length;

    console.log(colorPalette[parseInt(fetchColor('breast')) % ncolors]);

    if (props.coord_map === undefined) {
        return <></>/*ul className="legendlist">
            {props.coloring.map((l) => 
                <li className="legendtext" style={{color: hexColorRegex.test(l[1]) ? l[1] : colorPalette[parseInt(l[1]) % ncolors], liststyle: "circle"}}>
                    <span><p style={{color: "black"}}>{l[0]}</p></span>
                </li>)}
        </ul>*/
    } else {
        return <div style={{ position: 'relative', height: 0 }}>
            <img 
                src={map}
                className='paneltitle bodymap'
            />
            {console.log(props.coord_map)}
        </div>
    }
}

export default Legend;