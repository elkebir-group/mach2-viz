import React, { useState, useEffect, useContext } from "react"
import ClonalTree from "./ClonalTree.js";
import Migration from "./Migration.js";
import { useHistory } from 'react-router-dom';
import Legend from "./Legend.js";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import RightColumn from "./RightColumn.js";

import DefaultDict from "../utils/DefaultDict.js";

function insertParam(key, value) {
  // Get the current url
  let currentUrl = new URL(window.location.href);

  // Change a url parameter using URLSearchParams
  let urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
  urlParams.set(key, value);

  // Replace the URL
  //currentUrl.search = urlParams.toString();
  window.location.href = '#/viz?' + urlParams.toString();

  // Reload the page
  window.location.reload();
}

function handleKeyPress(event) {
  if (event.key === '/') {
    alert('Instructions:\n\nToggle and move around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponding anatomical location for the node.\n\nSelect different solutions from the dropdown on the top left of the panel.\n\nTo compare with another solution, click the [+] on the right. To view the solution space summary, click the [+] on the left.\n\nYou can return home by clicking the [X].');
  }
}

function Viz(props) {
    const history = useHistory();
    const [mu, setMu] = useState(0);
    const [gamma, setGamma] = useState(0);
    const jsonContents=localStorage.getItem("json_data");
    const wholeData = JSON.parse(jsonContents);
    const queryParameters = new URLSearchParams(window.location.hash.split("?")[1]);

    let labelName = queryParameters.get("labeling");

    if (labelName == "undefined") {
      insertParam("labeling", wholeData["solutions"][0]["name"]);
    }

    localStorage.setItem("selected", JSON.stringify(new DefaultDict(0)));
    localStorage.setItem("violations", JSON.stringify(new DefaultDict(0)));
    
    // const coloring = data["coloring"]

    const data = wholeData["solutions"].filter((item) => {return item["name"] === labelName})[0];

    // console.log(data["labeling"])
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

    console.log(coloring);

    const tree = data["tree"]
    const tree_labeling = data["labeling"]
    const migration = data["migration"]

    let labelnames = wholeData["solutions"].map((value, index) => {return value["name"]});

    let coord_map = wholeData["map"]; 

    let getParam = (key) => {
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(`?${url.hash.slice(1).split('?')[1]}`);

      return searchParams.get(key);
    }

    let handleLabelChange = (event) => {
      insertParam("labeling", event.target.value);
    }

    let addTab = (event) => {
      window.location = `${window.location.protocol}//${window.location.host}/mach2-viz/#/dualviz?labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling")}`;
    }

    let gotoSummary = (event) => {
      window.location = `${window.location.protocol}//${window.location.host}/mach2-viz/#/sumviz?labeling=${queryParameters.get("labeling")}`;
    }

    let rotateFn = (event) => {
      let rotated = queryParameters.get("rotated") === "true";
      insertParam("rotated", !rotated);
    }

    useEffect(() => {
      document.addEventListener("keydown", handleKeyPress);
      setMu(localStorage.getItem("mu"));
      setGamma(localStorage.getItem("gamma"));
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
        <div className="panel tab_add2" onClick={gotoSummary}><p className='addpanelp'><b>+</b></p></div>
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
                <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
                <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
                <button type="button" className="paneltitle button" onClick={rotateFn}>Rotate</button>
                <Migration tree={tree} labeling={tree_labeling} coloring={coloring} migration={migration} evtbus={eventBus}/>
              </div>
              <div className="panel migration">
                <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus}/>
              </div>
            </div>
            <RightColumn coord_map={coord_map} coloring={coloring} tree={tree} labeling={tree_labeling} evtbus={eventBus}/>
          </div>
        </div>
        <div className="panel tab_add" onClick={addTab}><p className='addpanelp'><b>+</b></p></div>
      </div>
    )
}

export default Viz;