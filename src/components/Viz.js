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

function handleKeyPress(event) {
  if (event.key === '/') {
    alert('Instructions:\n\nToggle and move around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponsing anatomical location for the node.\n\nSelect different labelings from the dropdown on the top left of the panel.\n\nOn the right, rotate around an anatomical model to visualize the corresponding metastatic locations.');
  }
}

function Viz(props) {
    const history = useHistory();
    const [mu, setMu] = useState(0);
    const [gamma, setGamma] = useState(0);
    const jsonContents=localStorage.getItem("json_data");
    const wholeData = JSON.parse(jsonContents);
    const queryParameters = new URLSearchParams(window.location.hash.split("?")[1]);

    const labelName = queryParameters.get("labeling");
    console.log("window thingy:", window.location.hash)
    console.log("queryParameters:", queryParameters.size)
    console.log("labelName:", labelName);
    
    // const coloring = data["coloring"]

    const data = wholeData["solutions"].filter((item) => {return item["name"] === labelName})[0];

    // console.log(data["labeling"])
    let coloring = data["labeling"]
      .map((item) => item[1])
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      })
      .map((item, index, self) => [item, `${self.indexOf(item)}`]);

    const tree = data["tree"]
    const tree_labeling = data["labeling"]
    const migration = data["migration"]

    let labelnames = wholeData["solutions"].map((value, index) => {return value["name"]});

    let coord_map = wholeData["map"]; 

    let insertParam = (key, value) => {
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(`?${url.hash.slice(1).split('?')[1]}`);

      // Modify or insert the parameter
      searchParams.set(key, value);

      // Update the hash portion of the URL
      url.hash = 'viz?' + searchParams.toString();
      window.location.href = url.toString();      

      window.location.reload();
    }

    let getParam = (key) => {
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(`?${url.hash.slice(1).split('?')[1]}`);

      return searchParams.get(key);
    }

    let handleLabelChange = (event) => {
      insertParam("labeling", event.target.value);
    }

    let addTab = (event) => {
      window.location = `${window.location.protocol}//${window.location.host}/machina-viz/#/dualviz?labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling")}`;
    }

    let gotoSummary = (event) => {
      window.location = `${window.location.protocol}//${window.location.host}/machina-viz/#/sumviz?labeling=${queryParameters.get("labeling")}`;
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