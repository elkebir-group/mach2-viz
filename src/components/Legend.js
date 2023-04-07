import React from 'react';
import { useState, useEffect, useRef } from "react";
import map from '../assets/map.jpeg';

function Legend(props) {
    const [height, setHeight] = useState(0)
    const ref = useRef(null)

    useEffect(() => {
        setHeight(ref.current.clientHeight)
    })

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
        return <div style={{ position: 'relative', height: 0 }} ref={ref}>
            <img 
                src={map}
                className='paneltitle'
            />
            {console.log(props.coord_map)}
            {props.coord_map.map((l, index) =>
              <div 
                className='panel label'
                id={l[0]}
                style={{
                    position: 'relative',
                    top: ~~(index / 2)*(height/(props.coord_map.length/2))+50*(index+1),
                    left: index % 2 == 0 ? 5 : 190,
                    opacity: 0.7,
                    zIndex: 1
                }}
                onMouseEnter={(e) => {
                    let target = document.querySelector(`#${l[0]}`);
                    target.style.opacity = 1;
                    target.style.zIndex = 1000;
                    target.style.fontWeight = 'bold';
                }}
                onMouseLeave={(e) => {
                    let target = document.querySelector(`#${l[0]}`);
                    target.style.opacity = 0.7;
                    target.style.zIndex = 1;
                    target.style.fontWeight = 'normal';
                }}
                >
                <ul className="legendlist">
                    <li className="labelentry" style={{color: hexColorRegex.test(fetchColor(l[0])) ? fetchColor(l[0]) : colorPalette[parseInt(fetchColor(l[0])) % ncolors], liststyle: "circle"}}>
                        <span><p style={{color: "black"}}>{l[0]}</p></span>
                    </li>
                </ul>
              </div>)}
        </div>
    }
}

export default Legend;