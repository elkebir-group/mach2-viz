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
import FilterMenu from "./FilterMenu.js";
import MigrationSummary from "./MigrationSummary.js";

import InlineSVG from 'react-inlinesvg';
import gear from '../assets/settings-gear.svg';

function insertParam(key, value) {
  // Get the current url
  let currentUrl = new URL(window.location.href);

  // Change a url parameter using URLSearchParams
  let urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
  urlParams.set(key, value);

  // Replace the URL
  //currentUrl.search = urlParams.toString();
  window.location.href = '#/viz?' + urlParams.toString();
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
    const [mu2, setMu2] = useState(0);
    const [gamma2, setGamma2] = useState(0);
    const [muSum, setMuSum] = useState(0);
    const [gammaSum, setGammaSum] = useState(0);
    const jsonContents=sessionStorage.getItem("json_data");
    const wholeData = JSON.parse(jsonContents);
    const queryParameters = new URLSearchParams(window.location.hash.split("?")[1]);

    let labelName = queryParameters.get("labeling");
    let labelName2 = queryParameters.get("labeling2");

    let selected = new DefaultDict(true);
    let violations = new DefaultDict(0);


    const [labeling, setLabeling] = useState(labelName)
    const [labeling2, setLabeling2] = useState(labelName2)

    const [rotate, setRotate] = useState(queryParameters.get("rotated") === "true");
    const [rotate2, setRotate2] = useState(queryParameters.get("rotated2") === "true");

    const [type, setType] = useState(queryParameters.get("type"))

    const [showPanel, setShowPanel] = useState(false);

    if (labelName == "undefined") {
      insertParam("labeling", wholeData["solutions"][0]["name"]);
      setLabeling(wholeData["solutions"][0]["name"])
    }
    if (labelName2 == "undefined") {
      insertParam("labeling2", wholeData["solutions"][0]["name"]);
      setLabeling2(wholeData["solutions"][0]["name"])
    }

    sessionStorage.setItem("selected", JSON.stringify(new DefaultDict(0)));
    sessionStorage.setItem("violations", JSON.stringify(new DefaultDict(0)));
    
    // console.log(data["labeling"])
    let coloring = wholeData["coloring"];

    const numSolns = wholeData["solutions"].length;

    const migrationSummary = wholeData["summary"]["migration"]

    const [data, setData] = useState(wholeData["solutions"].filter((item) => {return item["name"] === labeling})[0]);
    const [data2, setData2] = useState(wholeData["solutions"].filter((item) => {return item["name"] === labeling2})[0]);
    const [tree, setTree] = useState(data["tree"])
    const [tree_labeling, setTreeLabeling] = useState(data["labeling"])
    const [migration, setMigration] = useState(data["migration"])
    const [tree2, setTree2] = useState([])
    const [tree_labeling2, setTreeLabeling2] = useState([])
    const [migration2, setMigration2] = useState([])

    if (coloring === undefined || coloring.length === 0) {
      coloring = data["labeling"]
        .map((item) => item[1])
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        })
        .map((item, index, self) => [item, `${self.indexOf(item)}`]);
    }

    useEffect(() => {
      setTree(data["tree"])
      setTreeLabeling(data["labeling"])
      setMigration(data["migration"])
      setMu(sessionStorage.getItem("mu"));
      setGamma(sessionStorage.getItem("gamma"));
    }, [labeling])

    let labelnames = wholeData["solutions"].map((value, index) => {return value["name"]});

    let coord_map = wholeData["map"]; 

    let getParam = (key) => {
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(`?${url.hash.slice(1).split('?')[1]}`);

      return searchParams.get(key);
    }

    let handleLabelChange = (event) => {
      insertParam("labeling", event.target.value);
      setLabeling(event.target.value)
      setData(wholeData["solutions"].filter((item) => {return item["name"] === event.target.value})[0]);
    }

    let handleLabelChange2 = (event) => {
      insertParam("labeling2", event.target.value);
      setLabeling2(event.target.value)
      setData2(wholeData["solutions"].filter((item) => {return item["name"] === event.target.value})[0]);
    }

    let toggleSelected = (name) => {
      selected['title'] = wholeData['name'];
      selected[name] = !selected[name];
      let name_parts = name.split('\u2192');
      
      for (let i = 0; i < migrationSummary.length; i++) {
          if (migrationSummary[i][0] == name_parts[0] && migrationSummary[i][1] == name_parts[1]) {
              for (let j = 0; j < migrationSummary[i][2].length; j++) {
                  (selected[name] ? (violations[migrationSummary[i][2][j]] -= 1) : (violations[migrationSummary[i][2][j]] += 1))
              }
          }
      }

      sessionStorage.setItem("violations", JSON.stringify(violations));
      sessionStorage.setItem("selected", JSON.stringify(selected));        

      window.location.reload()
    }

    let addTab = (event) => {
      //window.location = `${window.location.protocol}//${window.location.host}/mach2-viz/#/dualviz?labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling")}`;
      insertParam("type", "dualviz")
      insertParam("labeling2", labeling)
      setLabeling2(labeling)
      setData2(wholeData["solutions"].filter((item) => {return item["name"] === labeling})[0]);
      setMu2(sessionStorage.getItem("mu2"));
      setGamma2(sessionStorage.getItem("gamma2"));
      setType('dualviz')
    }

    let closeTab = (tabIndex) => {
      if (type === 'dualviz') {
        setType('viz')
        console.log(tabIndex)
        if (tabIndex == 1) {
          setData(data2)
          setLabeling(labeling2)
          setRotate(rotate2)
          setTree(data2["tree"])
          setTreeLabeling(data2["labeling"])
          setMigration(data2["migration"])
        }
        insertParam('type', 'viz')
      } else {
        window.location = `${window.location.protocol}//${window.location.host}/#/`
      }
    }

    useEffect(() => {
      if (data2) {
        setTree2(data2["tree"])
        setTreeLabeling2(data2["labeling"])
        setMigration2(data2["migration"])
      }
    }, [data2])

    useEffect(() => {
      setMu2(sessionStorage.getItem("mu2"));
      setGamma2(sessionStorage.getItem("gamma2"));
    }, [tree2])

    let gotoSummary = (event) => {
      setType('sumviz');
      insertParam('type', 'sumviz')
    }

    let rotateFn = (event) => {
      let rotated = queryParameters.get("rotated") === "true";
      insertParam("rotated", !rotated);
      setRotate(!rotated)
    }

    let rotateFn2 = (event) => {
      let rotated2 = queryParameters.get("rotated2") === "true";
      insertParam("rotated2", !rotated2);
      setRotate2(!rotated2)
    }

    useEffect(() => {
      document.addEventListener("keydown", handleKeyPress);
      setMu(sessionStorage.getItem("mu"));
      setGamma(sessionStorage.getItem("gamma"));
      setMu2(sessionStorage.getItem("mu2"));
      setGamma2(sessionStorage.getItem("gamma2"));
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

    return (
      <div className="viz">
        <div className="panel tab_add2" onClick={gotoSummary}><p className='addpanelp'><b>+</b></p></div>
        {type == 'sumviz' ?
          <div className="panel info one">
            <div className="titlewrapper">
                <h3 className="viztitle"><b>Summary</b></h3>
                <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                <a onClick={() => {window.location.href=`/mach2-viz/#/viz?labeling=${queryParameters.get("labeling")}`}} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
            </div>
            <div className="panel migration top left sum">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <p className="paneltitle mu">{`\u03BC: ${muSum}`}</p>
                <p className="paneltitle gamma">{`\u03B3: ${gammaSum}`}</p>
                {data != null && <MigrationSummary data={migrationSummary} coloring={coloring} selected={selected} evtbus={eventBus} title={wholeData['name']}/>}
                {data == null && <h1 className="graphfail">--No Graphs Possible--</h1>}
            </div>
          </div> :
          <></>}
        <div className={`panel info ${
            type === 'dualviz' ? 'one' : 
            type === 'sumviz' ? 'one two ' :
            ''
          }`}>
          <div className="titlewrapper">
            <label className="titleelem left" for="labelings"><p><b>Full Labeling:
              <select name="labelings" id="labelings" onChange={handleLabelChange}>
                {labelnames.map(l => 
                  {return (l === labeling) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                )}
              </select>
            </b></p></label>
            <h3 className="viztitle"><b>{data["name"]}</b></h3>
            <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
            <Link onClick={closeTab.bind(null, 1)} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></Link>
          </div>
          <div className={coord_map === undefined ? "leftcolumn nolegend" : "leftcolumn"}>
            <div className={`panel migration top ${type === 'dualviz' ? 'left' : ''}`}>
              <p className="paneltitle"><b>Migration Graph</b></p>
              <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
              <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
              <button type="button" className="paneltitle button" onClick={rotateFn}>Rotate</button>
              <Migration tree={tree} labeling={tree_labeling} coloring={coloring} migration={migration} evtbus={eventBus} rotated={rotate}/>
            </div>
            <div className={`panel migration ${type === 'dualviz' ? 'left': ''}`}>
              <p className="paneltitle"><b>Clonal Tree</b></p>
              <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={eventBus}/>
            </div>
          </div>
        </div>
        {type == 'dualviz' ? 
          <div className="panel info one two">
            <div className="titlewrapper">
                <label className="titleelem left" for="labelings"><p><b>Full Labeling:
                <select name="labelings" id="labelings" onChange={handleLabelChange2}>
                    {labelnames.map(l => 
                    {return (l === labeling2) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                    )}
                </select>
                </b></p></label>
                <h3 className="viztitle"><b>{data2["name"]}</b></h3>
                <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                <a onClick={closeTab.bind(null, 2)} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
            </div>
            <div className={coord_map === undefined ? "leftcolumn nolegend" : "leftcolumn"}>
              <div className={`panel migration top ${type === 'dualviz' ? 'left' : ''}`}>
                <p className="paneltitle"><b>Migration Graph</b></p>
                <p className="paneltitle mu">{`\u03BC: ${mu2}`}</p>
                <p className="paneltitle gamma">{`\u03B3: ${gamma2}`}</p>
                <button type="button" className="paneltitle button" onClick={rotateFn2}>Rotate</button>
                <Migration tree={tree2} labeling={tree_labeling2} coloring={coloring} migration={migration2} evtbus={eventBus2} rightcol={true} rotated={rotate2}/>
              </div>
              <div className={`panel migration ${type === 'dualviz' ? 'left': ''}`}>
                <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree tree={tree2} labeling={tree_labeling2} coloring={coloring} evtbus={eventBus2} rightcol={true}/>
              </div>
            </div>
          </div> : 
          <></>}
        <div className="panel tab_add" onClick={addTab}><p className='addpanelp'><b>+</b></p></div>
      </div>
    )
}

export default Viz;