import React, { useState, useEffect } from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

import Migration from "./Migration.js";
import ClonalTree from "./ClonalTree.js";
import MigrationSummary from "./MigrationSummary.js";

function insertParam(key, value) {
    // Get the current url
    let currentUrl = new URL(window.location.href);
  
    // Change a url parameter using URLSearchParams
    let urlParams = new URLSearchParams(currentUrl.search);
    urlParams.set(key, value);
    console.log(urlParams.toString());
  
    // Replace the URL
    //currentUrl.search = urlParams.toString();
    window.location.href = 'dualviz?' + urlParams.toString();
  
    // Reload the page
    console.log(window.location);
    //window.location.reload();
}

function handleKeyPress(event) {
    if (event.key === '/') {
      alert('Instructions:\n\nToggle and move around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponsing anatomical location for the node.\n\nSelect different labelings from the dropdown on the top left of the panel.\n\nThe dual visualization window allows you to compare different solutions side by side!');
    }
  }

function SumViz() {
    const [mu, setMu] = useState(0);
    const [gamma, setGamma] = useState(0);

    const queryParameters = new URLSearchParams(window.location.search);
    const jsonContents=localStorage.getItem("json_data");
    const wholeData = JSON.parse(jsonContents);

    const labelName = queryParameters.get("labeling");

    const data = wholeData["solutions"].filter((item) => {return item["name"] === labelName})[0];

    let coloring = data["labeling"]
      .map((item) => item[1])
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      })
      .map((item, index, self) => [item, `${self.indexOf(item)}`]);

    const tree = data["tree"]
    const tree_labeling = data["labeling"];

    let labelnames = wholeData["solutions"].map((value, index) => {return value["name"]});

    let handleLabelChange = (event) => {
        insertParam("labeling", event.target.value);
    }

    let rotateFn = (event) => {
        let rotated = queryParameters.get("rotated") === "true";
        insertParam("rotated", !rotated);
    }

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

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress);
        setMu(localStorage.getItem("mu"));
        setGamma(localStorage.getItem("gamma"));
    });

    return <div className="viz">
        <div className="panel info one">
            <div className="titlewrapper">
                <h3 className="viztitle"><b>Summary</b></h3>
                <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                <a onClick={() => {window.location.href=`/viz?labeling=${queryParameters.get("labeling")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
            </div>
            <div className="panel migration top left">
                <MigrationSummary data={wholeData}/>
            </div>
            <div className="panel migration left">
                <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus}/>
            </div>
        </div>
        <div className="panel info one two">
            <div className="titlewrapper">
                <label className="titleelem left" for="labelings"><p><b>Full Labeling:
                <select name="labelings" id="labelings" onChange={handleLabelChange}>
                    {labelnames.map(l => 
                    {return (l === queryParameters.get("labeling2")) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                    )}
                </select>
                </b></p></label>
                <h3 className="viztitle"><b>{data["name"]}</b></h3>
                <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                <a onClick={() => {window.location.href=`/viz?labeling=${queryParameters.get("labeling")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
            </div>
            <div className="panel migration top left">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
                <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
                <button type="button" className="paneltitle button" onClick={rotateFn}>Rotate</button>
                <Migration tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus} rightcol={true}/>
            </div>
            <div className="panel migration left">
                <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus} rightcol={true}/>
            </div>
        </div>
    </div>
}

export default SumViz;
