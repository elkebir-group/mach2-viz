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
import Loading from "./Loading.js";
import ClonalSummary from "./ClonalSummary.js";

function insertParam(key, value) {
    // Get the current url
    let currentUrl = new URL(window.location.href);
  
    // Change a url parameter using URLSearchParams
    let urlParams = new URLSearchParams(currentUrl.search);
    urlParams.set(key, value);
  
    // Replace the URL
    //currentUrl.search = urlParams.toString();
    window.location.href = 'sumviz?' + urlParams.toString();
  
    // Reload the page
    //window.location.reload();
}

function handleKeyPress(event) {
    if (event.key === '/') {
      alert('Instructions:\n\nToggle and move around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponsing anatomical location for the node.\n\nSelect different labelings from the dropdown on the top left of the panel.\n\nThe dual visualization window allows you to compare different solutions side by side!');
    }
}

function SumViz() {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [mu, setMu] = useState(0);
    const [gamma, setGamma] = useState(0);
    const [muSum, setMuSum] = useState(0);
    const [gammaSum, setGammaSum] = useState(0);

    const queryParameters = new URLSearchParams(window.location.search);
    const jsonContents=localStorage.getItem("json_data");
    const wholeData = JSON.parse(jsonContents);

    const labelName = queryParameters.get("labeling");

    const data = wholeData["solutions"].filter((item) => {return item["name"] === labelName})[0];

    const migrationSummary = wholeData["summary"]["migration"]
    const summaryTree = wholeData["summary"]["tree"]
    const labelingTree = wholeData["summary"]["labeling"]

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

    let addTab = (event) => {
        window.location = `${window.location.protocol}//${window.location.host}/triviz?labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling")}`;
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
        //let intervalId = setInterval(() => {
        //    setProgress(prevProgress => prevProgress + 10);
        //}, 1000);

        
        // clearInterval(intervalId);
        document.addEventListener("keydown", handleKeyPress);
        setMu(localStorage.getItem("mu"));
        setGamma(localStorage.getItem("gamma"));
        setMuSum(localStorage.getItem("musum"));
        setGammaSum(localStorage.getItem("gammasum"));
        setIsLoading(false)

        //return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        setMuSum(localStorage.getItem("musum"));
        setGammaSum(localStorage.getItem("gammasum"));
    }, [isLoading])

    return (
        <div className="viz">
            {!isLoading ? (
                <>
                    <div className="panel info one sum">
                        <div className="titlewrapper">
                            <h3 className="viztitle"><b>Summary</b></h3>
                            <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                            <a onClick={() => {window.location.href=`/viz?labeling=${queryParameters.get("labeling")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
                        </div>
                        <div className="panel migration top left">
                            <p className="paneltitle"><b>Migration Graph</b></p>
                            <p className="paneltitle mu">{`\u03BC: ${muSum}`}</p>
                            <p className="paneltitle gamma">{`\u03B3: ${gammaSum}`}</p>
                            <MigrationSummary data={migrationSummary} coloring={coloring} evtbus={eventBus}/>
                        </div>
                        <div className="panel migration left">
                            <p className="paneltitle"><b>Clonal Tree</b></p>
                            <ClonalTree tree={summaryTree} labeling={labelingTree} coloring={coloring} evtbus={eventBus}/>
                        </div>
                    </div>
                    <div className="panel info one two sum">
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
                        </div>
                        <div className="panel migration top left">
                            <p className="paneltitle"><b>Migration Graph</b></p>
                            <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
                            <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
                            <button type="button" className="paneltitle button" onClick={rotateFn}>Rotate</button>
                            <Migration tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus}/>
                        </div>
                        <div className="panel migration left">
                            <p className="paneltitle"><b>Clonal Tree</b></p>
                            <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus} rightcol={true}/>
                        </div>
                    </div>
                    <div className="panel tab_add" onClick={addTab}><p className='addpanelp'><b>+</b></p></div>
                </>
            ) : (
                <Loading progress={progress}/>
            )}
        </div>
    )
}

export default SumViz;
