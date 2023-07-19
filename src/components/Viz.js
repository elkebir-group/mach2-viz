import React, { useState, useEffect, useContext } from "react"
import ClonalTree from "./ClonalTree.js";
import Migration from "./Migration.js";
import { useHistory } from 'react-router-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import DefaultDict from "../utils/DefaultDict.js";

// Panels
import SummaryPanel from "./SummaryPanel.js";
import MigrationPanel from "./MigrationPanel.js";

// Popup
import Popup from 'reactjs-popup'
import HelpPopup from "./HelpPopup.js";

/** Insert a URL parameter
 * 
 * @param {*} key (string) variable name
 * @param {*} value (string) variable value
 */
function insertParam(key, value) {
  // Change a url parameter using URLSearchParams
  let urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
  urlParams.set(key, value);

  // Replace the URL
  //currentUrl.search = urlParams.toString();
  window.location.href = '#/viz?' + urlParams.toString();
}

function Viz(props) {
    const [mu, setMu] = useState(0);
    const [gamma, setGamma] = useState(0);
    const [mu2, setMu2] = useState(0);
    const [gamma2, setGamma2] = useState(0);
    const [muSum, setMuSum] = useState(0);
    const [gammaSum, setGammaSum] = useState(0);
    const jsonContents=sessionStorage.getItem("json_data");
    // const wholeData = JSON.parse(jsonContents);

    // for filtering when selecting/unselecting edges on summary graph
    const [deletedEdges, setDeletedEdges] = useState([]);
    const [requiredEdges, setRequiredEdges] = useState([]);

    // for refreshing when adding/removing panels
    const [refreshCounter, setRefreshCounter] = useState(0);

    useEffect(() => {
      updateUsedData();
    }, [deletedEdges, requiredEdges]);

    function onDeleteSummaryEdge(edge_id) {
      setDeletedEdges([...deletedEdges, edge_id]);
    }

    function onRequireSummaryEdge(edge_id) {
      setRequiredEdges([...requiredEdges, edge_id]);
    }

    const [usedData, setUsedData] = useState(JSON.parse(jsonContents));

    function updateUsedData() {
      // TODO: Assuming no edges are shared between requiredEdges and deletedEdges
      // console.log(requiredEdges);
      // console.log(deletedEdges);

      const wholeData = JSON.parse(jsonContents);

      let tempUsedData = {
        "name": wholeData["name"],
        "solutions": [],
        "summary": {
          "migration": [],
        },
      };

      /*if (requiredEdges.length === 0 && deletedEdges.length === 0) {
        setUsedData(wholeData);
        return;
      }*/

      for (let i = 0; i < wholeData["solutions"].length; i++) {
        let foundDeletedEdge = false;
        // let foundRequiredEdge = false;
        let requiredEdgeCounter = 0;

        // if (requiredEdges.length === 0) {
        //   foundRequiredEdge = true;
        // }

        for (let j = 0; j < wholeData["solutions"][i]["migration"].length; j++) {
          // check deleteEdges:
          let migrationEdgeString = wholeData["solutions"][i]["migration"][j][0] + "->" + wholeData["solutions"][i]["migration"][j][1];
          for (let k = 0; k < deletedEdges.length; k++) {
            // create string from wholeData:
            if (migrationEdgeString === deletedEdges[k]) {
              foundDeletedEdge = true;
            }
          }

          for (let k = 0; k < requiredEdges.length; k++) {
            if (migrationEdgeString === requiredEdges[k]) {
              requiredEdgeCounter++;
            }
          }
        }

        if (!foundDeletedEdge && (requiredEdgeCounter === requiredEdges.length)) {
          // console.log(wholeData["solutions"][i]);
          const tempSolution = JSON.parse(JSON.stringify(wholeData["solutions"][i]))
          tempUsedData["solutions"].push(tempSolution);
        }
      }
      
      // check how to add summary in:
      for (let i = 0; i < tempUsedData["solutions"].length; i++) {
        for (let j = 0; j < tempUsedData["solutions"][i]["migration"].length; j++) {
          let edgeInSummary = false;
          // add edge to summary:
          for (let k = 0; k < tempUsedData["summary"]["migration"].length; k++) {
            // check if edge matches any of the summary edges:
            if (tempUsedData["summary"]["migration"][k][0] === tempUsedData["solutions"][i]["migration"][j][0]
                && tempUsedData["summary"]["migration"][k][1] === tempUsedData["solutions"][i]["migration"][j][1]) {
              edgeInSummary = true;
              tempUsedData["summary"]["migration"][k][2] += 1;
            }
          }
          if (!edgeInSummary) {
            let tempSummaryElement = [...tempUsedData["solutions"][i]["migration"][j].slice(0, -1), 1];
            tempUsedData["summary"]["migration"].push(tempSummaryElement);
          }
        }
      }
      setUsedData(tempUsedData);
      
      // TODO: Vikram: make new function
      let tempNames = tempUsedData["solutions"].map((value, index) => {return value["name"]})
      
      if (!tempNames.includes(data["name"])) {
        setData(tempUsedData["solutions"].filter((item) => {return item["name"] === tempNames[0]})[0])
      }

      if (data2 !== undefined && !tempNames.includes(data2["name"])) {
        setData2(tempUsedData["solutions"].filter((item) => {return item["name"] === tempNames[0]})[0])
      }
    }
    
    const [labelNames, setLabelNames] = useState(usedData["solutions"].map((value, index) => {return value["name"]}));

    const queryParameters = new URLSearchParams(window.location.hash.split("?")[1]);

    let labelName = queryParameters.get("labeling");
    let labelName2 = queryParameters.get("labeling2");

    const [labeling, setLabeling] = useState(labelName)
    const [labeling2, setLabeling2] = useState(labelName2)

    const [rotate, setRotate] = useState(queryParameters.get("rotated") === "true");
    const [rotate2, setRotate2] = useState(queryParameters.get("rotated2") === "true");

    const [type, setType] = useState(queryParameters.get("type"))

    if (labelName === "undefined") {
      insertParam("labeling", usedData["solutions"][0]["name"]);
      setLabeling(usedData["solutions"][0]["name"])
    }
    if (labelName2 === "undefined") {
      insertParam("labeling2", usedData["solutions"][0]["name"]);
      setLabeling2(usedData["solutions"][0]["name"])
    }

    sessionStorage.setItem("selected", JSON.stringify(new DefaultDict(0)));
    sessionStorage.setItem("violations", JSON.stringify(new DefaultDict(0)));
    
    let coloring = usedData["coloring"];

    const [data, setData] = useState(usedData["solutions"].filter((item) => {return item["name"] === labeling})[0]);
    const [data2, setData2] = useState(usedData["solutions"].filter((item) => {return item["name"] === labeling2})[0]);
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

    let coloringDict = {};
    for (var i = 0; i < coloring.length; i++) {
      coloringDict[coloring[i][0]] = coloring[i][1];
    }

    useEffect(() => {
      updateUsedData();
      setTree(data["tree"]);
      setTreeLabeling(data["labeling"]);
      setMigration(data["migration"]);
      setMu(sessionStorage.getItem("mu"));
      setGamma(sessionStorage.getItem("gamma"));
    }, [labeling])

    useEffect(() => {
      setLabelNames(usedData["solutions"].map((value, index) => {return value["name"]}))
    }, [usedData])

    useEffect(() => {
      if (!labelNames.includes(labeling)) {
        insertParam("labeling", labelNames[0])
        setLabeling(labelNames[0])
      }

      if (!labelNames.includes(labeling2)) {
        insertParam("labeling2", labelNames[0])
        setLabeling2(labelNames[0])
      }
    }, [labelNames])

    let coord_map = usedData["map"]; 

    let handleLabelChange = (event) => {
      insertParam("labeling", event.target.value);
      setLabeling(event.target.value)
      setData(usedData["solutions"].filter((item) => {return item["name"] === event.target.value})[0]);
    }

    let handleLabelChange2 = (event) => {
      insertParam("labeling2", event.target.value);
      setLabeling2(event.target.value)
      setData2(usedData["solutions"].filter((item) => {return item["name"] === event.target.value})[0]);
    }

    let addTab = (event) => {
      //window.location = `${window.location.protocol}//${window.location.host}/mach2-viz/#/dualviz?labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling")}`;
      if (type === 'sumviz') {
        insertParam("type", "triviz")
        setType('triviz')
      } else {
        insertParam("type", "dualviz")
        setType('dualviz')
      }
      insertParam("labeling2", labeling)
      setLabeling2(labeling)
      setData2(usedData["solutions"].filter((item) => {return item["name"] === labeling})[0]);
      setMu2(sessionStorage.getItem("mu2"));
      setGamma2(sessionStorage.getItem("gamma2"));
    }

    let closeTab = (tabIndex) => {
      if (type === 'dualviz' || type === 'triviz') {
        setType(type === 'dualviz' ? 'viz' : 'sumviz')
        console.log(tabIndex)
        if (tabIndex === 1) {
          setData(data2)
          setLabeling(labeling2)
          setRotate(rotate2)
          setTree(data2["tree"])
          setTreeLabeling(data2["labeling"])
          setMigration(data2["migration"])
        }
        insertParam('type', 'viz')
      } else {
        window.location = `${window.location.protocol}//${window.location.host}/mach2-viz/#/`
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

    // refresh when type is changed
    useEffect(() => {
      setRefreshCounter(prevCounter => prevCounter + 1);
    }, [type]);

    let gotoSummary = (event) => {
      if (type === 'dualviz') {
        setType('triviz');
        insertParam('type', 'triviz')
      } else {
        setType('sumviz');
        insertParam('type', 'sumviz')
      }
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
      setMu(sessionStorage.getItem("mu"));
      setGamma(sessionStorage.getItem("gamma"));
      setMu2(sessionStorage.getItem("mu2"));
      setGamma2(sessionStorage.getItem("gamma2"));
      setMuSum(sessionStorage.getItem("musum"));
      setGammaSum(sessionStorage.getItem("gammasum"));
      updateUsedData()
    }, []);

    useEffect(() => {
      document.addEventListener("keydown", handleKeyPress);
      setMuSum(sessionStorage.getItem("musum"));
      setGammaSum(sessionStorage.getItem("gammasum"));
    })

    const [evtBus, setEvtBus] = useState({
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
    });

    // Popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    function togglePopup() {
      setIsPopupOpen(!isPopupOpen);
    }

    /** TODO: Replace this with an actual window rather than just an alert message
     * 
     * @param {*} event Event metadata
     */
    function handleKeyPress(event) {
      if (event.key === '/') {
        // alert('Instructions:\n\nToggle and move around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponding anatomical location for the node.\n\nSelect different solutions from the dropdown on the top left of the panel.\n\nTo compare with another solution, click the [+] on the right. To view the solution space summary, click the [+] on the left.\n\nYou can return home by clicking the [X].');
        togglePopup();
      }
    }




    // keeping track of edges that are not used
    // update unusedEdges whenever

    return (
      <div className="viz">
        <HelpPopup isPopupOpen={isPopupOpen} togglePopup={togglePopup}></HelpPopup>
        {type !== 'sumviz' && type !== 'triviz' ? 
          <div className="panel tab_add2" onClick={gotoSummary}><p className='addpanelp'><b>+</b></p></div>
          : <></>}
        {(type === 'sumviz' || type === 'triviz') ?
          <SummaryPanel 
            key={refreshCounter}
            type={type}
            setType={setType}
            insertParam={insertParam}
            usedData={usedData}
            coloring={coloring}
            muSum={muSum}
            gammaSum={gammaSum}
            evtBus={evtBus}
            setEvtBus={setEvtBus}
            onDeleteSummaryEdge={onDeleteSummaryEdge}
            onRequireSummaryEdge={onRequireSummaryEdge}
          /> : <></>}
        <div className={`panel info ${
            type === 'dualviz' ? 'one' : 
            type === 'sumviz' ? 'one two' :
            type === 'triviz' ? 'tri two' :
            ''
          }`}>
          {/* <MigrationPanel
            type={type}
            setType={setType}
            handleLabelChange={handleLabelChange}
            labeling={labeling}
            labelNames={labelNames}
            data={data}
            closeTab={closeTab}

            gamma={gamma}
            mu={mu}
            rotateFn={rotateFn}
            tree={tree}
            tree_labeling={tree_labeling}
            coloring={coloring}
            migration={migration}
            evtBus={evtBus}
            rotate={rotate}
            coord_map={coord_map}
          >
          </MigrationPanel> */}
          <div className="titlewrapper">
            <label className="titleelem left" for="labelings"><p><b>Full Labeling:
              <select name="labelings" id="labelings" onChange={handleLabelChange}>
                {labelNames.map(l => 
                  {return (l === labeling) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                )}
              </select>
            </b></p></label>
            <h3 className="viztitle"><b>{data["name"]}</b></h3>
            {(type !== 'dualviz' && type !== 'triviz' && type !== 'sumviz') ?
              <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p> :
              <></>}
            {type !== 'sumviz' ? 
              <Link onClick={closeTab.bind(null, 1)} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></Link>
              : <></>}
          </div>
          <div className={coord_map === undefined ? "leftcolumn nolegend" : "leftcolumn"}>
            <div className={`panel migration top ${(type === 'dualviz' || type === 'triviz') ? 'left' : ''}`}>
              <p className="paneltitle"><b>Migration Graph</b></p>
              <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
              <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
              <button type="button" className="paneltitle button" onClick={rotateFn}>Rotate</button>
              <Migration key={refreshCounter} tree={tree} labeling={tree_labeling} coloring={coloring} migration={migration} evtbus={evtBus} rotated={rotate}/>
            </div>
            <div className={`panel migration ${(type === 'dualviz' || type === 'triviz') ? 'left': ''}`}>
              <p className="paneltitle"><b>Clonal Tree</b></p>
              <ClonalTree key={refreshCounter} tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={evtBus}/>
            </div>
          </div>
        </div>
        {(type === 'dualviz' || type === 'triviz') ? 
          <div className={`panel info ${type === 'dualviz' ? 'one two' : 'tri three'}`}>
            <div className="titlewrapper">
                <label className="titleelem left" for="labelings"><p><b>Full Labeling:
                <select name="labelings" id="labelings" onChange={handleLabelChange2}>
                    {labelNames.map(l => 
                    {return (l === labeling2) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                    )}
                </select>
                </b></p></label>
                <h3 className="viztitle"><b>{data2["name"]}</b></h3>
                <a onClick={closeTab.bind(null, 2)} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
            </div>
            <div className={coord_map === undefined ? "leftcolumn nolegend" : "leftcolumn"}>
              <div className={`panel migration top ${(type === 'dualviz' || type === 'triviz') ? 'left' : ''}`}>
                <p className="paneltitle"><b>Migration Graph</b></p>
                <p className="paneltitle mu">{`\u03BC: ${mu2}`}</p>
                <p className="paneltitle gamma">{`\u03B3: ${gamma2}`}</p>
                <button type="button" className="paneltitle button" onClick={rotateFn2}>Rotate</button>
                <Migration key={refreshCounter} tree={tree2} labeling={tree_labeling2} coloring={coloring} migration={migration2} evtbus={evtBus} rightcol={true} rotated={rotate2}/>
              </div>
              <div className={`panel migration ${(type === 'dualviz' || type === 'triviz') ? 'left': ''}`}>
                <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree key={refreshCounter} tree={tree2} labeling={tree_labeling2} coloring={coloring} evtbus={evtBus} rightcol={true}/>
              </div>
            </div>
          </div> : 
          <></>}
        {type !== 'dualviz' && type !== 'triviz' ?
          <div className="panel tab_add" onClick={addTab}><p className='addpanelp'><b>+</b></p></div>
          : <></>
        }
      </div>
    )
}

export default Viz;