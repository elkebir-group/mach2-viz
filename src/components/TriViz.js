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
import FilterMenu from "./FilterMenu.js";

import InlineSVG from 'react-inlinesvg';
import gear from '../assets/settings-gear.svg';

import DefaultDict from '../utils/DefaultDict.js';

function insertParam(key, value) {
    // Get the current url
    let currentUrl = new URL(window.location.href);
  
    // Change a url parameter using URLSearchParams
    let urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
    urlParams.set(key, value);
    console.log(urlParams.toString());
  
    // Replace the URL
    //currentUrl.search = urlParams.toString();
    window.location.href = '#/triviz?' + urlParams.toString();
  
    // Reload the page
    console.log(window.location);
    window.location.reload();
}

function handleKeyPress(event) {
    if (event.key === '/') {
      alert('Instructions:\n\nToggle and move around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponsing anatomical location for the node.\n\nSelect different labelings from the dropdown on the top left of the panel.\n\nThe dual visualization window allows you to compare different solutions side by side!');
    }
}

function TriViz(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [mu, setMu] = useState(0);
    const [gamma, setGamma] = useState(0);
    const [mu2, setMu2] = useState(0);
    const [gamma2, setGamma2] = useState(0);
    const [muSum, setMuSum] = useState(0);
    const [gammaSum, setGammaSum] = useState(0);
    const [showPanel, setShowPanel] = useState(false);

    const queryParameters = new URLSearchParams(window.location.hash.split("?")[1]);
    const jsonContents=localStorage.getItem("json_data");
    const wholeData = JSON.parse(jsonContents);

    const labelName = queryParameters.get("labeling");
    const labelName2 = queryParameters.get("labeling2");

    const data = wholeData["solutions"].filter((item) => {return item["name"] === labelName})[0];
    const data2 = wholeData["solutions"].filter((item) => {return item["name"] === labelName2})[0];

    const migrationSummary = wholeData["summary"]["migration"];

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

    let coloring = data["labeling"]
      .map((item) => item[1])
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      })
      .map((item, index) => [item, `${index}`]);

      const tree = data["tree"]
      const tree2 = data2["tree"]
      const tree_labeling = data["labeling"];
      const tree_labeling2 = data2["labeling"];
      const migration = data["migration"];
      const migration2 = data2["migration"];
  
      let labelnames = wholeData["solutions"].map((value, index) => {return value["name"]});

      const numSolns = wholeData["solutions"].length;
  
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
  
      useEffect(() => {
        //let intervalId = setInterval(() => {
        //    setProgress(prevProgress => prevProgress + 10);
        //}, 1000);

        //setTimeout(() => {
        //    clearInterval(intervalId);
          document.addEventListener("keydown", handleKeyPress);
          setMu(localStorage.getItem("mu"));
          setGamma(localStorage.getItem("gamma"));
          setMu2(localStorage.getItem("mu2"));
          setGamma2(localStorage.getItem("gamma2"));
          setMuSum(localStorage.getItem("musum"));
          setGammaSum(localStorage.getItem("gammasum"));
          setIsLoading(false)
        //}, 10000);

        //return () => clearInterval(intervalId);
      }, []);

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
  
      return <div className="viz">
        {!isLoading ? (
                <>
            <div className="panel info tri">
                <div className="titlewrapper">
                    <InlineSVG src={gear} className="settingsgear" onClick={() => {console.log(window.location.state); setShowPanel(!showPanel)}} />
                    <FilterMenu show={showPanel} numSolns={numSolns} data={migrationSummary} selected={selected} toggleSelected={toggleSelected} />
                    <h3 className="viztitle"><b>Summary</b></h3>
                    <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                    <a onClick={() => {window.location.href=`/machina-viz/#/dualviz?labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling2")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
                </div>
                <div className="panel migration top left sum">
                    <p className="paneltitle"><b>Migration Graph</b></p>
                    <p className="paneltitle mu">{`\u03BC: ${muSum}`}</p>
                    <p className="paneltitle gamma">{`\u03B3: ${gammaSum}`}</p>
                    <MigrationSummary data={migrationSummary} coloring={coloring} evtbus={eventBus}/>
                </div>
            </div>
          <div className="panel info tri two">
              <div className="titlewrapper">
                  <label className="titleelem left" for="labelings"><p><b>Full Labeling:
                  <select name="labelings" id="labelings" onChange={handleLabelChange}>
                      {(labelnames.filter(name => (violations[name] == 0))).map(l => 
                      {return (l === queryParameters.get("labeling")) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                      )}
                  </select>
                  </b></p></label>
                  <h3 className="viztitle"><b>{data["name"]}</b></h3>
                  <a onClick={() => {window.location.href=`/machina-viz/#/sumviz?labeling=${queryParameters.get("labeling2")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
              </div>
              <div className="panel migration top left">
                  <p className="paneltitle"><b>Migration Graph</b></p>
                  <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
                  <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
                  <Migration tree={tree} labeling={tree_labeling} migration={migration} coloring={coloring} evtbus={eventBus}/>
              </div>
              <div className="panel migration left">
                  <p className="paneltitle"><b>Clonal Tree</b></p>
                  <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus}/>
              </div>
          </div>
          <div className="panel info tri three">
              <div className="titlewrapper">
                  <label className="titleelem left" for="labelings"><p><b>Full Labeling:
                  <select name="labelings" id="labelings" onChange={handleLabelChange2}>
                      {(labelnames.filter(name => (violations[name] == 0))).map(l => 
                      {return (l === queryParameters.get("labeling2")) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                      )}
                  </select>
                  </b></p></label>
                  <h3 className="viztitle"><b>{data2["name"]}</b></h3>
                  <a onClick={() => {window.location.href=`/machina-viz/#/sumviz?labeling=${queryParameters.get("labeling")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
              </div>
              <div className="panel migration top left">
                  <p className="paneltitle"><b>Migration Graph</b></p>
                  <p className="paneltitle mu">{`\u03BC: ${mu2}`}</p>
                  <p className="paneltitle gamma">{`\u03B3: ${gamma2}`}</p>
                  <Migration tree={tree2} labeling={tree_labeling2} migration={migration2} coloring={coloring} evtbus={eventBus} rightcol={true}/>
              </div>
              <div className="panel migration left">
                  <p className="paneltitle"><b>Clonal Tree</b></p>
                  <ClonalTree tree={tree2} labeling={tree_labeling2} coloring={coloring} evtbus={eventBus} rightcol={true}/>
              </div>
          </div>
          </>
           ) : (
            <Loading progress={progress}/>
        )}
    </div>
} 

export default TriViz;