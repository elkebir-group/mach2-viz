import React, { useState, useEffect } from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import InlineSVG from 'react-inlinesvg';

import Migration from "./Migration.js";
import ClonalTree from "./ClonalTree.js";
import MigrationSummary from "./MigrationSummary.js";
import Loading from "./Loading.js";
import FilterMenu from "./FilterMenu.js";

import DefaultDict from "../utils/DefaultDict.js";


import gear from '../assets/settings-gear.svg';

function insertParam(key, value) {
    // Get the current url
    let currentUrl = new URL(window.location.href);
  
    // Change a url parameter using URLSearchParams
    console.log(currentUrl.hash);
    let urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
    urlParams.set(key, value);
  
    // Replace the URL
    //currentUrl.search = urlParams.toString();
    window.location.href = '#/sumviz?' + urlParams.toString();
  
    // Reload the page
    window.location.reload();
}

function handleKeyPress(event) {
    if (event.key === '/') {
      alert('Instructions:\n\nIn this view you can compare the summary with a single solution. In the summary graph, corresponding migration and clonal tree components with bold on hover.\n\nToggle and move around the migration graphs and the clonal tree. Hover over nodes in the clonal tree to find the corresponding anatomical location for the node.\n\nSelect different labelings from the dropdown on the top left of the panel.\n\nTo add another solution into view, click the [+] on the right.\n\nYou can close out panels by clicking the [X].');
    }
}

function SumViz() {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [mu, setMu] = useState(0);
    const [gamma, setGamma] = useState(0);
    const [muSum, setMuSum] = useState(0);
    const [gammaSum, setGammaSum] = useState(0);
    const [showPanel, setShowPanel] = useState(false);

    let selected = new DefaultDict(true);
    let selectedStorage = JSON.parse(localStorage.getItem("selected"));
    
    for (let key in selectedStorage) {
        selected[key] = selectedStorage[key];
    }

    let violations = new DefaultDict(0);
    let violationsStorage = JSON.parse(localStorage.getItem("violations"));

    for (let key in violationsStorage) {
        violations[key] = violationsStorage[key];
    }

    const queryParameters = new URLSearchParams(window.location.hash.split("?")[1]);
    const jsonContents=localStorage.getItem("json_data");
    const wholeData = JSON.parse(jsonContents);

    const labelName = queryParameters.get("labeling");

    let data = wholeData["solutions"].filter((item) => {return item["name"] === labelName})[0];

    const numSolns = wholeData["solutions"].length;

    const migrationSummary = wholeData["summary"]["migration"]

    let coloring = wholeData["coloring"];
    console.log(coloring)

    if ((coloring === undefined || coloring.length === 0) && data != null) {
      coloring = data["labeling"]
        .map((item) => item[1])
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        })
        .map((item, index, self) => [item, `${self.indexOf(item)}`]);
    }

    let tree = null;
    let tree_labeling = null;
    let migration = null;

    if (data != null) {
        tree = data["tree"]
        tree_labeling = data["labeling"];
        migration = data["migration"];
    }

    let labelnames = wholeData["solutions"].map((value, index) => {return value["name"]});

    let handleLabelChange = (event) => {
        insertParam("labeling", event.target.value);
    }

    let rotateFn = (event) => {
        let rotated = queryParameters.get("rotated") === "true";
        insertParam("rotated", !rotated);
    }

    let addTab = (event) => {
        window.location = `${window.location.protocol}//${window.location.host}/mach2-viz/#/triviz?labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling")}`;
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
        const handleOutsideClick = (event) => {
          if (!event.target.closest('.outside-click-container')) {
            setShowPanel(false);
          }
        };
  
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
          document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

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

    let toggleSelected = (name) => {
        selected[name] = !selected[name];
        let name_parts = name.split('\u2192');
        
        for (let i = 0; i < migrationSummary.length; i++) {
            if (migrationSummary[i][0] == name_parts[0] && migrationSummary[i][1] == name_parts[1]) {
                for (let j = 0; j < migrationSummary[i][2].length; j++) {
                    (selected[name] ? (violations[migrationSummary[i][2][j]] -= 1) : (violations[migrationSummary[i][2][j]] += 1))
                }
            }
        }

        localStorage.setItem("violations", JSON.stringify(violations));
        localStorage.setItem("selected", JSON.stringify(selected));        
    }

    return (
        <div className="viz">
            {!isLoading ? (
                <>
                    <div className="panel info one sum">
                        <div className="titlewrapper">
                            <InlineSVG src={gear} className="settingsgear" onClick={() => { setShowPanel(!showPanel); }} />
                            <div className="outside-click-container">
                                <FilterMenu show={showPanel} numSolns={numSolns} data={migrationSummary} selected={selected} toggleSelected={toggleSelected} sum='sum'/>
                            </div>
                            <h3 className="viztitle"><b>Summary</b></h3>
                            <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                            <a onClick={() => {window.location.href=`/mach2-viz/#/viz?labeling=${queryParameters.get("labeling")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
                        </div>
                        <div className="panel migration top left sum">
                            <p className="paneltitle"><b>Migration Graph</b></p>
                            <p className="paneltitle mu">{`\u03BC: ${muSum}`}</p>
                            <p className="paneltitle gamma">{`\u03B3: ${gammaSum}`}</p>
                            {data != null && <MigrationSummary data={migrationSummary} coloring={coloring} selected={selected} evtbus={eventBus}/>}
                            {data == null && <h1 className="graphfail">--No Graphs Possible--</h1>}
                        </div>
                    </div>
                    <div className="panel info one two sum">
                        <div className="titlewrapper">
                            <label className="titleelem left" for="labelings"><p><b>Full Labeling:
                            {data != null &&
                            <select name="labelings" id="labelings" onChange={handleLabelChange}>
                                {(labelnames.filter(name => (violations[name] == 0))).map(l => 
                                {return (l === queryParameters.get("labeling")) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                                )}
                            </select>
                            }
                            {data == null &&
                            <select name="labelings" id="labelings" onChange={handleLabelChange}>
                                <option value={null} selected>-- No Graphs --</option>
                            </select>
                            }
                            </b></p></label>
                            {data != null && <h3 className="viztitle"><b>{data["name"]}</b></h3>}
                            <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                        </div>
                        <div className="panel migration top left">
                            <p className="paneltitle"><b>Migration Graph</b></p>
                            <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
                            <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
                            <button type="button" className="paneltitle button" onClick={rotateFn}>Rotate</button>
                            {data != null && <Migration tree={tree} labeling={tree_labeling} migration={migration} coloring={coloring} evtbus={eventBus}/>}
                            {data == null && <h1 className="graphfail">--No Graphs Possible--</h1>}
                        </div>
                        <div className="panel migration left">
                            <p className="paneltitle"><b>Clonal Tree</b></p>
                            {data != null && <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus} rightcol={true}/>}
                            {data == null && <h1 className="graphfail">--No Graphs Possible--</h1>}
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
