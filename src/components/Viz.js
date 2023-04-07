import React, { useState, useEffect } from "react"
import { decompressUrlSafe } from '../utils/lzma-url.js'
import ClonalTree from "./ClonalTree.js";
import Migration from "./Migration.js";
import Legend from "./Legend.js";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import RightColumn from "./RightColumn.js";

function insertParam(key, value) {
  // Get the current url
  let currentUrl = new URL(window.location.href);

  // Change a url parameter using URLSearchParams
  let urlParams = new URLSearchParams(currentUrl.search);
  urlParams.set(key, value);
  console.log(urlParams.toString());

  // Replace the URL
  //currentUrl.search = urlParams.toString();
  window.location.href = 'viz?' + urlParams.toString();

  // Reload the page
  console.log(window.location);
  //window.location.reload();
}

function handleKeyPress(event) {
  if (event.key === '/') {
    alert('Instructions:\n\nToggle and move around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponsing anatomical location for the node.\n\nSelect different labelings from the dropdown on the top left of the panel.\n\nOn the right, rotate around an anatomical model to visualize the corresponding metastatic locations.');
  }
}

function Viz() {
    const queryParameters = new URLSearchParams(window.location.search);
    const fileContents = decompressUrlSafe(queryParameters.get("data"));
    const data = JSON.parse(fileContents);
    
    const coloring = data["coloring"]
    const tree = data["clone_tree"]["tree"]
    const tree_labeling = data["clone_tree"]["labeling"].map((value, index) => {
      if (value["name"] === queryParameters.get("labeling")) {
        return value["data"];
      }
    }).filter((item) => {return item != undefined})[0];

    let labelnames = data["clone_tree"]["labeling"].map((value, index) => {return value["name"]});

    let coord_map = data["map"]; 

    let handleLabelChange = (event) => {
      insertParam("labeling", event.target.value);
    }

    let addTab = (event) => {
      window.location = `${window.location.protocol}//${window.location.host}/dualviz?data=${queryParameters.get("data")}&labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling")}`;
    }

    useEffect(() => {
      document.addEventListener("keydown", handleKeyPress);
    });

    const eventBus = {
      listeners: [],
      addListener(callback) {
        this.listeners.push(callback);
      },
      removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
      },
      fireEvent(eventName, eventData) {
        this.listeners.forEach((listener) => {
          listener(eventName, eventData);
        });
      },
    };

    return (
      <div className="viz">
        <div className="panel info">
          <div className="titlewrapper">
            <label className="titleelem left" for="labelings"><p><b>Full Labeling:
              <select name="labelings" id="labelings" onChange={handleLabelChange}>
                {labelnames.map(l => 
                  {return (l === queryParameters.get("labeling")) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                )}
              </select>
            </b></p></label>
            <h3 className="viztitle"><b>{data["name"]}</b></h3>
            <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
            <Link to="" style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></Link>
          </div>
          <div className="columnwrapper">
            <div className={coord_map === undefined ? "leftcolumn nolegend" : "leftcolumn"}>
              <div className="panel migration top">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <Migration tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus}/>
              </div>
              <div className="panel migration">
                <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus}/>
              </div>
            </div>
            <RightColumn coord_map={coord_map} coloring={coloring}/>
          </div>
        </div>
        <div className="panel tab_add" onClick={addTab}><p className='addpanelp'><b>+</b></p></div>
      </div>
    )
}

export default Viz;