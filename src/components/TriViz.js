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
    console.log(urlParams.toString());
  
    // Replace the URL
    //currentUrl.search = urlParams.toString();
    window.location.href = 'triviz?' + urlParams.toString();
  
    // Reload the page
    console.log(window.location);
    //window.location.reload();
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

    const queryParameters = new URLSearchParams(window.location.search);
    const jsonContents=localStorage.getItem("json_data");
    const wholeData = JSON.parse(jsonContents);

    const labelName = queryParameters.get("labeling");
    const labelName2 = queryParameters.get("labeling2");

    const data = wholeData["solutions"].filter((item) => {return item["name"] === labelName})[0];
    const data2 = wholeData["solutions"].filter((item) => {return item["name"] === labelName2})[0];

    const migrationSummary = wholeData["summary"]["migration"]
    const summaryTree = wholeData["summary"]["tree"]
    const labelingTree = wholeData["summary"]["labeling"]

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
  
      let labelnames = wholeData["solutions"].map((value, index) => {return value["name"]});
  
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
        let intervalId = setInterval(() => {
            setProgress(prevProgress => prevProgress + 10);
        }, 1000);

        setTimeout(() => {
            clearInterval(intervalId);
          document.addEventListener("keydown", handleKeyPress);
          setMu(localStorage.getItem("mu"));
          setGamma(localStorage.getItem("gamma"));
          setMu2(localStorage.getItem("mu2"));
          setGamma2(localStorage.getItem("gamma2"));
          setMuSum(localStorage.getItem("musum"));
          setGammaSum(localStorage.getItem("gammasum"));
          setIsLoading(false)
        }, 10000);

        return () => clearInterval(intervalId);
      });
  
      return <div className="viz">
        {!isLoading ? (
                <>
            <div className="panel info tri">
                <div className="titlewrapper">
                    <h3 className="viztitle"><b>Summary</b></h3>
                    <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                    <a onClick={() => {window.location.href=`/dualviz?labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling2")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
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
                      {labelnames.map(l => 
                      {return (l === queryParameters.get("labeling")) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                      )}
                  </select>
                  </b></p></label>
                  <h3 className="viztitle"><b>{data["name"]}</b></h3>
                  <a onClick={() => {window.location.href=`/sumviz?labeling=${queryParameters.get("labeling2")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
              </div>
              <div className="panel migration top left">
                  <p className="paneltitle"><b>Migration Graph</b></p>
                  <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
                  <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
                  <Migration tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus}/>
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
                      {labelnames.map(l => 
                      {return (l === queryParameters.get("labeling2")) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                      )}
                  </select>
                  </b></p></label>
                  <h3 className="viztitle"><b>{data2["name"]}</b></h3>
                  <a onClick={() => {window.location.href=`/sumviz?labeling=${queryParameters.get("labeling")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
              </div>
              <div className="panel migration top left">
                  <p className="paneltitle"><b>Migration Graph</b></p>
                  <p className="paneltitle mu">{`\u03BC: ${mu2}`}</p>
                  <p className="paneltitle gamma">{`\u03B3: ${gamma2}`}</p>
                  <Migration tree={tree2} labeling={tree_labeling2} coloring={coloring} evtbus={eventBus} rightcol={true}/>
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