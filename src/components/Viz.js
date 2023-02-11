import React, { useState } from "react"
import {
  Routes,
  Route,
  useParams,
  BrowserRouter
} from "react-router-dom"
import ReactDOM from "react-dom";
import { decompressUrlSafe } from '../url_compression/lzma-url.js'

function Viz() {
    const queryParameters = new URLSearchParams(window.location.search)
    const fileContents = decompressUrlSafe(queryParameters.get("data"))
    const data = JSON.parse(fileContents);
    const locations = data["coloring"].map((value, index) => {return value[0]});

    const [toggle, setToggle] = useState("▶ JSON View");
    const [jsonPanel, setJsonPanel] = useState({visibility: "hidden", height: 0});
    let toggleClick = () => {
      setToggle((toggle === "▶ JSON View") ? "▾ JSON View" : "▶ JSON View");
      setJsonPanel((jsonPanel.visibility === "hidden") ? {visibility: "visible", height: "300px"} : {visibility: "hidden", height: 0});
    }

    return (
      <div className="viz">
        <div className="panel instr">
          <p><b>Instructions:</b> Drag over the model in the right to 
          rotate the figure around. Anatomic sites will be 
          highlighted according to the color scheme in the 
          legend to the right. To view anatomic sites in 
          different systems, click the tabs in the right.</p>

          <p>Click the tabs below to switch between viewing the 
          clonal tree and migration graph. Multiple labelings
          and trees may be inferred if a reported labeling is
          not given. In which case there will be a drop-down to
          select a potential solution.</p>
        </div>
        <div className="panel inputs">
          <nav className="togglemenu">
            <p className="jsonheader" onClick={toggleClick}><b>{toggle}</b></p>
            <ul className="panel jsonview" style={jsonPanel}>
              <p>{fileContents}</p>
            </ul>
          </nav>
          <p><b>Patient:</b> {data["name"]}</p>
          <p><b>Metastasis Locations:</b></p>
          <ul>
            {locations.map(l => <li><p>{l}</p></li>)}
          </ul>
        </div>
      </div>
    )
}

export default Viz;