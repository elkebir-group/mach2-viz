import React, { useState, useEffect } from "react"
import Legend from "./Legend.js";
import MigrationMap from "./MigrationMap.js";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function RightColumn(props) {
    if (props.coord_map === undefined) {
        return <></>
    } else {
        return <div className="rightcolumn">
            <div className={props.coord_map === undefined ? "panel migration legend top" : "panel migration legend top map"}>
                <Legend coloring={props.coloring} coord_map={props.coord_map}/>
                <MigrationMap tree={props.tree} labeling={props.labeling} coloring={props.coloring}/>
            </div>
        </div>
    }
    
}

export default RightColumn;