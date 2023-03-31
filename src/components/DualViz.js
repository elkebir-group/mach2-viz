import React, { useState, useEffect } from "react"
import { decompressUrlSafe } from '../utils/lzma-url.js'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

import Migration from "./Migration.js";
import ClonalTree from "./ClonalTree.js";

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

function DualViz() {
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
    const tree_labeling2 = data["clone_tree"]["labeling"].map((value, index) => {
        if (value["name"] === queryParameters.get("labeling2")) {
            return value["data"];
        }
    }).filter((item) => {return item != undefined})[0];

    let labelnames = data["clone_tree"]["labeling"].map((value, index) => {return value["name"]});

    let handleLabelChange = (event) => {
        insertParam("labeling", event.target.value);
    }

    let handleLabelChange2 = (event) => {
        insertParam("labeling2", event.target.value);
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

    return <div className="viz">
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
                <Link to={`viz?data=${queryParameters.get("data")}&labeling=${queryParameters.get("labeling2")}`} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></Link>
            </div>
            <div className="panel migration top left">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <Migration tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus}/>
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
                <h3 className="viztitle"><b>{data["name"]}</b></h3>
                <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                <Link to={`viz?data=${queryParameters.get("data")}&labeling=${queryParameters.get("labeling")}`} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></Link>
            </div>
            <div className="panel migration top left">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <Migration tree={tree} labeling={tree_labeling2} coloring={coloring} evtbus={eventBus2}/>
            </div>
            <div className="panel migration left">
                <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree tree={tree} labeling={tree_labeling2} coloring={coloring} evtbus={eventBus2}/>
            </div>
        </div>
    </div>
}

export default DualViz;
