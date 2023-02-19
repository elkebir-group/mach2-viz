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
    const queryParameters = new URLSearchParams(window.location.search);
    const fileContents = decompressUrlSafe(queryParameters.get("data"));
    const data = JSON.parse(fileContents);
    const locations = data["coloring"].map((value, index) => {return value[0]});

    const [toggle, setToggle] = useState("▶ JSON View");
    const [jsonPanel, setJsonPanel] = useState({visibility: "hidden", height: 0});
    let toggleClick = () => {
      setToggle((toggle === "▶ JSON View") ? "▾ JSON View" : "▶ JSON View");
      setJsonPanel((jsonPanel.visibility === "hidden") ? {visibility: "visible", height: "300px"} : {visibility: "hidden", height: 0});
    }

    let graphnames = data["migration_graph"].map((value, index) => {return value["name"]});
    let labelnames = data["clone_tree"]["full_labeling"].map((value, index) => {return value["name"]});

    return (
      <div className="viz">
        <div className="leftpanel">
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
            <label><p><b>Migration Graph:
              <select name="graphs" id="graphs">
                {graphnames.map(l => <option value={l}>{l}</option>)}
              </select>
            </b></p></label>
            <label for="labelings"><p><b>Full Labeling:
              <select name="labelings" id="labelings">
                {labelnames.map(l => <option value={l}>{l}</option>)}
              </select>
            </b></p></label>
            <p><b>Metastasis Locations:</b></p>
            <ul>
              {locations.map(l => <li><p>{l}</p></li>)}
            </ul>
          </div>
        </div>
        <div className="panel info">
          <h3><b>{data["name"]}</b></h3>
          <div className="panel tab"><p className="paneltitle"><b>Migration Graph</b></p></div>
          <div className="panel migration"></div>
          <div className="panel tab clonal"><p className="paneltitle"><b>Clonal Tree</b></p></div>
          <div className="panel migration"></div>
        </div>
      </div>
    )
}

export default Viz;