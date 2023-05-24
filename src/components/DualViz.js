import React, { useState, useEffect } from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

import Migration from "./Migration.js";
import ClonalTree from "./ClonalTree.js";

import DefaultDict from "../utils/DefaultDict.js";

function insertParam(key, value) {
    // Get the current url
    let currentUrl = new URL(window.location.href);
  
    // Change a url parameter using URLSearchParams
    let urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
    urlParams.set(key, value);
  
    // Replace the URL
    //currentUrl.search = urlParams.toString();
    window.location.href = '#/dualviz?' + urlParams.toString();
  
    // Reload the page
    window.location.reload();
}

function handleKeyPress(event) {
    if (event.key === '/') {
      alert('Instructions:\n\nThe dual visualization window allows you to compare different solutions side by side!\n\nToggle and move around the migration graphs and clonal trees. Hover over nodes in the clonal trees to find the corresponding anatomical location for the node.\n\nSelect different labelings from the dropdown on the top left of the panel.\n\nClick the [+] to compare these solutions with the solution space summary.\n\nYou can close out panels by clicking the [X].');
    }
  }

function DualViz() {
    const [mu, setMu] = useState(0);
    const [gamma, setGamma] = useState(0);
    const [mu2, setMu2] = useState(0);
    const [gamma2, setGamma2] = useState(0);
    const queryParameters = new URLSearchParams(window.location.hash.split("?")[1]);
    const jsonContents=localStorage.getItem("json_data");
    const wholeData = JSON.parse(jsonContents);

    let labelName = queryParameters.get("labeling");
    let labelName2 = queryParameters.get("labeling2");

    console.log(wholeData);
    console.log(labelName, labelName2);

    if (labelName == "undefined") {
      insertParam("labeling", wholeData["solutions"][0]["name"]);
    }
    if (labelName2 == "undefined") {
      insertParam("labeling2", wholeData["solutions"][0]["name"]);
    }

    console.log(labelName, labelName2);

    const data = wholeData["solutions"].filter((item) => {return item["name"] === labelName})[0];
    const data2 = wholeData["solutions"].filter((item) => {return item["name"] === labelName2})[0];

    localStorage.setItem("selected", JSON.stringify(new DefaultDict(0)));
    localStorage.setItem("violations", JSON.stringify(new DefaultDict(0)));

    let coloring = wholeData["coloring"];
    console.log(coloring)

    if (coloring === undefined || coloring.length === 0) {
      coloring = data["labeling"]
        .map((item) => item[1])
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        })
        .map((item, index, self) => [item, `${self.indexOf(item)}`]);
    }

    const tree = data["tree"]
    const tree2 = data2["tree"]
    const tree_labeling = data["labeling"];
    const tree_labeling2 = data2["labeling"];
    const migration = data["migration"];
    const migration2 = data2["migration"];

    let labelnames = wholeData["solutions"].map((value, index) => {return value["name"]});

    let handleLabelChange = (event) => {
        insertParam("labeling", event.target.value);
    }

    let handleLabelChange2 = (event) => {
        insertParam("labeling2", event.target.value);
    }

    let rotateFn = (event) => {
        let rotated = queryParameters.get("rotated") === "true";
        insertParam("rotated", !rotated);
    }

    let rotateFn2 = (event) => {
        let rotated = queryParameters.get("rotated2") === "true";
        insertParam("rotated2", !rotated);
    }

    let gotoSummary = (event) => {
      window.location = `${window.location.protocol}//${window.location.host}/mach2-viz/#/triviz?labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling2")}`;
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

    const eventBus2 = {
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
        setMu2(localStorage.getItem("mu2"));
        setGamma2(localStorage.getItem("gamma2"));
    });

    return <div className="viz">
        <div className="panel tab_add2" onClick={gotoSummary}><p className='addpanelp'><b>+</b></p></div>
        <div className="panel info one">
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
                <a onClick={() => {window.location.href=`/mach2-viz/#/viz?labeling=${queryParameters.get("labeling2")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
            </div>
            <div className="panel migration top left">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
                <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
                <button type="button" className="paneltitle button" onClick={rotateFn}>Rotate</button>
                <Migration tree={tree} labeling={tree_labeling} migration={migration} coloring={coloring} evtbus={eventBus}/>
            </div>
            <div className="panel migration left">
                <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus}/>
            </div>
        </div>
        <div className="panel info one two">
            <div className="titlewrapper">
                <label className="titleelem left" for="labelings"><p><b>Full Labeling:
                <select name="labelings" id="labelings" onChange={handleLabelChange2}>
                    {labelnames.map(l => 
                    {return (l === queryParameters.get("labeling2")) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                    )}
                </select>
                </b></p></label>
                <h3 className="viztitle"><b>{data2["name"]}</b></h3>
                <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                <a onClick={() => {window.location.href=`/mach2-viz/#/viz?labeling=${queryParameters.get("labeling")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
            </div>
            <div className="panel migration top left">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <p className="paneltitle mu">{`\u03BC: ${mu2}`}</p>
                <p className="paneltitle gamma">{`\u03B3: ${gamma2}`}</p>
                <button type="button" className="paneltitle button" onClick={rotateFn2}>Rotate</button>
                <Migration tree={tree2} labeling={tree_labeling2} migration={migration2} coloring={coloring} evtbus={eventBus2} rightcol={true}/>
            </div>
            <div className="panel migration left">
                <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree tree={tree2} labeling={tree_labeling2} coloring={coloring} evtbus={eventBus2} rightcol={true}/>
            </div>
        </div>
    </div>
}

export default DualViz;
