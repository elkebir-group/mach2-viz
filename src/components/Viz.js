import React, { useState, useEffect } from "react"
import {
  Routes,
  Route,
  useParams,
  BrowserRouter
} from "react-router-dom"
import ReactDOM from "react-dom";
import { decompressUrlSafe } from '../utils/lzma-url.js'
import ClonalTree from "./ClonalTree.js";

function insertParam(key, value) {
  // Get the current url
  let currentUrl = new URL(window.location.href);

  // Change a url parameter using URLSearchParams
  let urlParams = new URLSearchParams(currentUrl.search);
  urlParams.set(key, value);

  // Replace the URL
  currentUrl.search = urlParams.toString();
  window.location.href = urlParams.toString();

  // Reload the page
  window.location.reload();
}

function Viz() {
    let posX;
    useEffect(() => {
      const handleResize = () => {
        document.documentElement.style.setProperty('--vbar', "0px");
        posX = document.getElementsByClassName("panel divider")[0].offsetLeft;
      }

      posX = document.getElementsByClassName("panel divider")[0].offsetLeft;

      window.addEventListener('resize', handleResize);
    }, []);

    const dragFn = (e) => {
      let diff = e.clientX - posX;
      console.log(e.clientX, diff);
      if (e.clientX !== 0) {
        document.documentElement.style.setProperty('--vbar', diff + "px");
      }
    }

    const queryParameters = new URLSearchParams(window.location.search);
    const fileContents = decompressUrlSafe(queryParameters.get("data"));
    const data = JSON.parse(fileContents);
    const locations = data["coloring"].map((value, index) => {return value[0]});
    
    const tree = data["clone_tree"]["tree"]
    const tree_labeling = data["clone_tree"]["full_labeling"].map((value, index) => {
      if (value["name"] === queryParameters.get("labeling")) {
        return value["data"];
      }
    })[0];

    const [toggle, setToggle] = useState("▶ JSON View");
    const [jsonPanel, setJsonPanel] = useState({visibility: "hidden", height: 0});
    let toggleClick = () => {
      setToggle((toggle === "▶ JSON View") ? "▾ JSON View" : "▶ JSON View");
      setJsonPanel((jsonPanel.visibility === "hidden") ? {visibility: "visible", height: "300px"} : {visibility: "hidden", height: 0});
    }

    let graphnames = data["migration_graph"].map((value, index) => {return value["name"]});
    let labelnames = data["clone_tree"]["full_labeling"].map((value, index) => {return value["name"]});

    let handleLabelChange = (event) => {
      insertParam("labeling", event.target.value);
    }

    let handleGraphChange = (event) => {
      insertParam("graph", event.target.value);
    }

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
              <select name="graphs" id="graphs" onChange={handleGraphChange}>
                {graphnames.map(l => <option value={l}>{l}</option>)}
              </select>
            </b></p></label>
            <label for="labelings"><p><b>Full Labeling:
              <select name="labelings" id="labelings" onChange={handleLabelChange}>
                {labelnames.map(l => <option value={l}>{l}</option>)}
              </select>
            </b></p></label>
            <p><b>Metastasis Locations:</b></p>
            <ul>
              {locations.map(l => <li><p>{l}</p></li>)}
            </ul>
          </div>
        </div>
        <div className="panel divider" draggable onDrag={dragFn}></div>
        <div className="panel info">
          <h3><b>{data["name"]}</b></h3>
          <div className="columnwrapper">
            <div className="leftcolumn">
              <div className="panel tab"><p className="paneltitle"><b>Migration Graph</b></p></div>
              <div className="panel migration"></div>
              <div className="panel tab clonal"><p className="paneltitle"><b>Clonal Tree</b></p></div>
              <div className="panel migration">
                <ClonalTree tree={tree} labeling={tree_labeling}/>
              </div>
            </div>
            <div className="rightcolumn">
              <div className="panel tab legend"><p className="paneltitle"><b>Legend</b></p></div>
              <div className="panel migration legend"></div>
              <div className="panel tab legend map"><p className="paneltitle"><b>Map</b></p></div>
              <div className="panel migration legend map"></div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default Viz;