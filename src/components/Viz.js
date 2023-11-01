import React, { useState, useEffect } from "react"
import ClonalTree from "./ClonalTree.js";
import Migration from "./Migration.js";
// import {
//   Link
// } from "react-router-dom";

import DefaultDict from "../utils/DefaultDict.js";
import { decompressUrlSafe } from '../utils/lzma-url.js';

// Panels
import SummaryPanel from "./SummaryPanel.js";

// Popup
import HelpPopup from "./HelpPopup.js";
import NoSolutionsPopup from "./NoSolutionsPopup.js";

/**
 * Finds the root of a tree represented by an edge list.
 * @param {Array<Array<number>>} edgeList - The edge list representing the tree.
 * Each inner array should contain three elements: [u, v, weight].
 * @returns The root node of the tree, or null if the tree is empty or has disconnected components.
 */
function findRoot(edgeList) {
  // Create a map to store the indegree of each node
  const indegreeMap = new Map();

  // Traverse the edge list and populate the indegree map
  for (const [src, dest] of edgeList) {
    if (!indegreeMap.has(src)) {
      indegreeMap.set(src, 0);
    }
    if (!indegreeMap.has(dest)) {
      indegreeMap.set(dest, 0);
    }
    indegreeMap.set(dest, indegreeMap.get(dest) + 1);
  }

  // Find the root (node with indegree 0)
  let root;
  indegreeMap.forEach((indegree, node) => {
    if (indegree === 0) {
      if (root) {
        // If there is more than one node with indegree 0, then the tree is invalid.
        throw new Error('Invalid tree: multiple roots');
      }
      root = node;
    }
  });

  if (root === undefined) {
    // If there is no node with indegree 0, then the tree is invalid.
    throw new Error('Invalid tree: no root found');
  }

  return root;
}

/**
 * Constructs a frequency dictionary from an array, where keys are elements in the array, 
 * and values represent the number of occurrences of each element.
 *
 * @param {Array} arr - The input array from which to construct the frequency dictionary.
 * @returns {Object} An object representing the frequency dictionary, 
 *                   where keys are elements and values are their occurrences.
 */
function constructFrequencyDictionary(arr) {
  const frequencyDict = {};
  
  for (const item of arr) {
    if (frequencyDict[item]) {
      frequencyDict[item]++;
    } else {
      frequencyDict[item] = 1;
    }
  }
  
  return frequencyDict;
}

/** Return location of clonal tree root
 * 
 * @param {Array} tree tree represented as an edgelist
 * @param {Array} labeling anatomic labeling of clones
 *  - Each entry is an array of two containing [clone, location]
 */
function fetchRootLocation(tree, labeling) {
  var root = findRoot(tree);

  for (const entry of labeling) {
    if (entry[0] === root) {
      return entry[1]
    }
  }

  return null
}

/** Fetch tree roots across the data
 * 
 * @param {Object} data filtered MACH2 output data
 */
function fetchRoots(data) {
  // Fetch each tree in the solution
  var solutions = data['solutions'];
  var trees = solutions.map((soln) => soln['tree']);

  // Get the anatomic locations of the roots of each of the trees
  var roots = trees.map((tree) => findRoot(tree));
  var rootLocations = roots.map((root, index) => {
    for (const entry of solutions[index]['labeling']) {
      if (entry[0] === root) {
        return entry[1]
      }
    }
    // never reaches this
    return 0;
  })

  // Construct a frequency mapping
  return constructFrequencyDictionary(rootLocations);
}

/** Insert a URL parameter */
function insertParam(key, value) {
  // Change a url parameter using URLSearchParams
  let urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
  urlParams.set(key, value);

  // Replace the URL
  window.location.href = '#/viz?' + urlParams.toString();
}

function Viz(props) {
  const [mu, setMu] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [mu2, setMu2] = useState(0);
  const [gamma2, setGamma2] = useState(0);
  const [muSum, setMuSum] = useState(0);
  const [gammaSum, setGammaSum] = useState(0);
  const jsonContents = decompressUrlSafe(sessionStorage.getItem("json_data"));

  const jsonDict = JSON.parse(jsonContents);

  // for filtering when selecting/unselecting edges on summary graph
  const [deletedEdges, setDeletedEdges] = useState([]);
  const [requiredEdges, setRequiredEdges] = useState([]);

  // for refreshing when adding/removing panels
  const [refreshCounter, setRefreshCounter] = useState(0);

  // for switching between original and new clonal trees
  // these exist per panel (left = L, right = R)
  const [clonalL, setClonalL] = useState(false);
  const [clonalR, setClonalR] = useState(false);

  // Roots data
  const [roots, setRoots] = useState([]);
  const [requiredRoots, setRequiredRoots] = useState([]);
  const [deletedRoots, setDeletedRoots] = useState([]);

  // Summary filter operations stack
  const [filterStack, setFilterStack] = useState([]);

  // Use the clonalL field to set fontweight to bold according to the state
  // Styles ending in L are for the left panel
  // The leftText is for the original clonal tree
  /*
  const leftTextStyleL = {
    fontWeight: !clonalL ? 'bold' : 'normal',
  }
  const rightTextStyleL = {
    fontWeight: clonalL ? 'bold' : 'normal',
  }*/

  useEffect(() => {
    updateUsedData();
  }, [deletedEdges, requiredEdges, deletedRoots, requiredRoots]);

  function onDeleteSummaryEdge(edge_id) {
    let [source, target] = edge_id.split('->');
    if (source !== 'roots') {
      //console.log("delete");
      // if the edge is currently required, unrequire it and then delete
      if (requiredEdges.includes(edge_id)) {
        const updatedEdges = requiredEdges.filter((edge) => edge !== edge_id);
        setRequiredEdges(updatedEdges);
        setFilterStack([...filterStack, `deletedrequired edge ${edge_id}`]);
      } else {
        setFilterStack([...filterStack, `deleted edge ${edge_id}`]);
      }

      setDeletedEdges([...deletedEdges, edge_id]);
    } else {
      //console.log("delete root");
      //console.log(deletedRoots)
      setFilterStack([...filterStack, `deleted root ${target}`]);
      setDeletedRoots([...deletedRoots, target]);
    }
  }

  function onRequireSummaryEdge(edge_id) {
    let [source, target] = edge_id.split('->')
    if (source !== 'roots') {
      if (requiredEdges.includes(edge_id)) {
        //console.log("relax");
        // If edge_id exists, remove all instances of edge_id from requiredEdges
        const updatedEdges = requiredEdges.filter((edge) => edge !== edge_id);
        setRequiredEdges(updatedEdges);
        setFilterStack([...filterStack, `relaxed edge ${edge_id}`]);
      } else {
        //console.log("require");
        setFilterStack([...filterStack, `required edge ${edge_id}`]);
        setRequiredEdges([...requiredEdges, edge_id]);
      }
    } else {
      //console.log("require root");
      setFilterStack([...filterStack, `required root ${target}`]);
      setRequiredRoots([...requiredRoots, target]);
    }
  }

  function clearData() {
    setDeletedEdges([])
    setRequiredEdges([])
    setDeletedRoots([])
    setRequiredRoots([])
    setFilterStack([])
  }

  function onToggleInputClonalL() {
    if (!clonalL) setClonalL(!clonalL)
  }

  function onToggleOutputClonalL() {
    if (clonalL) setClonalL(!clonalL)
  }

  function onToggleInputClonalR() {
    if (!clonalR) setClonalR(!clonalR)
  }

  function onToggleOutputClonalR() {
    if (clonalR) setClonalR(!clonalR)
  }

  const [usedData, setUsedData] = useState(jsonDict);

  function updateUsedData() {
    const wholeData = jsonDict;

    let tempUsedData = {
      "name": wholeData["name"],
      "original": wholeData["original"],
      "solutions": [],
      "summary": {
        "migration": [],
      },
    };

    for (let i = 0; i < wholeData["solutions"].length; i++) {
      let treeEntry = wholeData["solutions"][i]["tree"]
      let labelingEntry = wholeData["solutions"][i]["labeling"]
      let migrationEntry = wholeData["solutions"][i]["migration"]

      let rootLocation = fetchRootLocation(treeEntry, labelingEntry);

      let foundDeletedEdge = false;

      // We'll accept a root if we aren't requiring an edge or it is within our required list
      let foundRequiredRoot = requiredRoots.length === 0 || requiredRoots.includes(rootLocation);

      // We'll blacklist a root if there even is a blacklist and it contains the root
      let foundDeletedRoot  = deletedRoots.length !== 0 && deletedRoots.includes(rootLocation);

      // let foundRequiredEdge = false;
      let requiredEdgeCounter = 0;
      
      for (let j = 0; j < migrationEntry.length; j++) {
        // check deleteEdges:
        let migrationEdgeString = migrationEntry[j][0] 
          + "->" 
          + wholeData["solutions"][i]["migration"][j][1];
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

      if (!foundDeletedRoot && foundRequiredRoot && !foundDeletedEdge && (requiredEdgeCounter === requiredEdges.length)) {
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

    if (tempUsedData["summary"]["migration"].length === 0){
      // TODO: Ensure that the filter stack is updated before we reach this point in the code
      // check the filter stack to revert everything back to normal:
      const last_edit = filterStack[filterStack.length - 1];
      setFilterStack(filterStack.slice(0, -1));
      if (last_edit.slice(0, 12) === 'deleted edge') {
        //console.log("the last command was a delete edge command");
        setDeletedEdges(deletedEdges.slice(0, -1));
      } else if (last_edit.slice(0, 12) === 'deleted root') {
        //console.log("the last command was a delete root command");
        setDeletedEdges(deletedRoots.slice(0, -1));
      } else if (last_edit.slice(0, 13)  === 'required root') {
        //console.log("the last command was a require root command");
        setDeletedEdges(requiredRoots.slice(0, -1));
      } else {
        //console.log("the last command was a require edge command");
        setRequiredEdges(requiredEdges.slice(0, -1));
      }

      toggleNoSolutionsPopup();
      return -1;
    }

    if(wholeData["coloring"]) {
      tempUsedData["coloring"] = JSON.parse(JSON.stringify(wholeData["coloring"]));
    }

    setUsedData(tempUsedData);
    setRoots(fetchRoots(tempUsedData));

    let tempNames = tempUsedData["solutions"].map((value, index) => { return value["name"] })

    if (multiSoln) {
      let tempNames1 = tempNames.filter((value, index) => { return inputData['solution_names'].includes(value) });
      let tempNames2 = tempNames.filter((value, index) => { return inputData2['solution_names'].includes(value) });

      if (!tempNames1.includes(data["name"])) {
        setData(tempUsedData['solutions'].filter((item) => { return item['name'] === tempNames1[0] })[0])
      }
  
      if (multiSoln && data2 !== undefined && !tempNames2.includes(data2['name'])) {
        setData2(tempUsedData['solutions'].filter((item) => { return item['name'] === tempNames2[0]})[0])
      }
    } else {
      if (!tempNames.includes(data["name"])) {
        setData(tempUsedData["solutions"].filter((item) => { return item["name"] === tempNames[0] })[0])
      }

      if (data2 !== undefined && !tempNames.includes(data2["name"])) {
        setData2(tempUsedData["solutions"].filter((item) => { return item["name"] === tempNames[0] })[0])
      }
    }
    return 0;
  }

  const multiSoln = Array.isArray(usedData['original'])

  const [labelNames, setLabelNames] = useState(usedData["solutions"].map((value, index) => { return value["name"] }));
  const [inputNames, setInputNames] = useState(multiSoln ? usedData["original"].map((value, index) => { return value["name"] }) : []);

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

  const [data, setData] = useState(usedData["solutions"].filter((item) => { return item["name"] === labeling })[0]);
  const [data2, setData2] = useState(usedData["solutions"].filter((item) => { return item["name"] === labeling2 })[0]);
  const [tree, setTree] = useState(data["tree"])
  const [tree_labeling, setTreeLabeling] = useState(data["labeling"])
  const [migration, setMigration] = useState(data["migration"])
  const [tree2, setTree2] = useState([])
  const [tree_labeling2, setTreeLabeling2] = useState([])
  const [migration2, setMigration2] = useState([])
  const [clonalMap, setClonalMap] = useState([])
  const [clonalMap2, setClonalMap2] = useState([])
  const [inputTree, setInputTree] = useState(multiSoln ? jsonDict["original"][0]["name"] : "")
  const [inputTree2, setInputTree2] = useState(multiSoln ? jsonDict["original"][0]["name"] : "")
  const [inputData, setInputData] = useState(multiSoln ? jsonDict["original"][0] : "")
  const [inputData2, setInputData2] = useState(multiSoln ? jsonDict["original"][0] : "")

  // Flag if the original tree exists in the data, 
  // and fetch the data if it exists
  var origExists = true;
  var originalTree;
  var originalLabeling
  try {
    originalTree = usedData['original']['tree'];
    originalLabeling = usedData['original']['labeling'];
  } catch {
    origExists = false;
  }

  // let coloring = usedData["coloring"];
  const [coloring, setColoring] = useState(usedData["coloring"]);

  const colorPalette = [
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
    "#6a3d9a",
    "#ffff99",
    "#b15928"
  ]

  if (coloring === undefined || coloring.length === 0) {

    // Extract labels from the data
    const labels = data["labeling"].map((item) => item[1]);

    // Get unique labels
    const uniqueLabels = labels.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    // Map each unique label to a new format: [label, indexAsString]
    const formattedLabels = uniqueLabels.map((label, index) => [label, `${colorPalette[index % colorPalette.length]}`]);

    //console.log(formattedLabels);

    // Result
    setColoring(formattedLabels);
    // coloring = formattedLabels;
  }

  let coloringDict = {};

  useEffect(() => {
    for (var i = 0; i < coloring.length; i++) {
      coloringDict[coloring[i][0]] = coloring[i][1];
    }
  }, [coloring])

  useEffect(() => {
    updateUsedData();
    setTree(data["tree"]);
    setTreeLabeling(data["labeling"]);
    setMigration(data["migration"]);
    setMu(sessionStorage.getItem("mu"));
    setGamma(sessionStorage.getItem("gamma"));

    if (data["origin_node"] !== undefined) {
      setClonalMap(data["origin_node"])
    }
  }, [labeling])

  useEffect(() => {
    setLabelNames(usedData["solutions"].map((value, index) => { return value["name"] }))

    if (multiSoln) {
      let solutionNames = usedData["solutions"].map((value, index) => { return value["name"] });

      let temps = usedData["original"].filter((value, index) => {
        return value['solution_names'].some(item => solutionNames.includes(item))
      }).map((value, index) => { return value["name"] })

      setInputNames(temps);
    }
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
    setData(usedData["solutions"].filter((item) => { return item["name"] === event.target.value })[0]);
  }

  let handleLabelChange2 = (event) => {
    insertParam("labeling2", event.target.value);
    setLabeling2(event.target.value)
    setData2(usedData["solutions"].filter((item) => { return item["name"] === event.target.value })[0]);
  }

  let handleInputChange = (event) => {
    insertParam("input", event.target.value);
    setInputTree(event.target.value);

    usedData['original'].forEach((elem) => {
      if (elem['name'] === event.target.value) {
        let targetLabel = elem['solution_names'].filter((e) => labelNames.includes(e))[0]

        setInputData(elem);
        setLabeling(targetLabel);
        setData(usedData['solutions'].filter((item) => {return item["name"] === targetLabel})[0]);
      }
    })
  }

  let handleInputChange2 = (event) => {
    insertParam("input2", event.target.value);
    setInputTree2(event.target.value);

    usedData['original'].forEach((elem) => {
      if (elem['name'] === event.target.value) {
        let targetLabel = elem['solution_names'].filter((e) => labelNames.includes(e))[0]

        setInputData2(elem);
        setLabeling2(targetLabel);
        setData2(usedData['solutions'].filter((item) => {return item["name"] === targetLabel})[0]);
      }
    })
  }

  let addTab = (event) => {
    if (type === 'sumviz') {
      insertParam("type", "triviz")
      setType('triviz')
    } else {
      insertParam("type", "dualviz")
      setType('dualviz')
    }
    insertParam("labeling2", labeling)
    setLabeling2(labeling)
    setData2(usedData["solutions"].filter((item) => { return item["name"] === labeling })[0]);
    setMu2(sessionStorage.getItem("mu2"));
    setGamma2(sessionStorage.getItem("gamma2"));
  }

  let closeTab = (tabIndex) => {
    if (type === 'dualviz' || type === 'triviz') {
      setType(type === 'dualviz' ? 'viz' : 'sumviz')
      if (tabIndex === 1) {
        setData(data2)
        setLabeling(labeling2)
        setRotate(rotate2)
        setTree(data2["tree"])
        setTreeLabeling(data2["labeling"])
        setMigration(data2["migration"])
        setInputData(inputData2)
        setInputTree(inputTree2)

        if (data2["origin_node"] !== undefined) {
          setClonalMap(data["origin_node"])
        }
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

      if (data2["origin_node"] !== undefined) {
        setClonalMap2(data["origin_node"])
      }
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

  let resetFn = (index) => {
    evtBus.fireEvent('resetMigration', { index })
  }

  let resetClonal = (index) => {
    evtBus.fireEvent('resetClonal', {index})
  }

  useEffect(() => {
    setMu(sessionStorage.getItem("mu"));
    setGamma(sessionStorage.getItem("gamma"));
    setMu2(sessionStorage.getItem("mu2"));
    setGamma2(sessionStorage.getItem("gamma2"));
    setMuSum(sessionStorage.getItem("musum"));
    setGammaSum(sessionStorage.getItem("gammasum"));
    updateUsedData()

    document.addEventListener("keydown", handleKeyPress);

    let loadingOverlay = document.getElementById('overlay');

    if (loadingOverlay) {
      loadingOverlay.parentElement.removeChild(loadingOverlay);
    }
  }, []);

  // NOTE: This is a state because undos need to thicken and unthicken the edge
  // Setting a state will allow the object to change on runtime (adding listeners and firing events)
  // eslint-disable-next-line no-unused-vars
  const [evtBus, _] = useState({
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

  // Popups
  const [isHelpPopupOpen, setIsHelpPopupOpen] = useState(false);
  const [isNoSolutionsPopupOpen, setIsNoSolutionsPopupOpen] = useState(false);

  function toggleNoSolutionsPopup() {
    setIsNoSolutionsPopupOpen(!isNoSolutionsPopupOpen);
  }

  function toggleHelpPopup() {
    setIsHelpPopupOpen(!isHelpPopupOpen);
  }

  /** TODO: Replace this with an actual window rather than just an alert message
   * 
   * @param {*} event Event metadata
   */
  function handleKeyPress(event) {
    if (event.key === '/') {
      // alert('Instructions:\n\nToggle and move around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponding anatomical location for the node.\n\nSelect different solutions from the dropdown on the top left of the panel.\n\nTo compare with another solution, click the [+] on the right. To view the solution space summary, click the [+] on the left.\n\nYou can return home by clicking the [X].');
      //console.log("/ key pressed!")
      toggleHelpPopup();
    }
  }

  // console.log(filterStack)
  // keeping track of edges that are not used
  // update unusedEdges whenever

  return (
    <div className="viz">
      <HelpPopup isPopupOpen={isHelpPopupOpen} togglePopup={toggleHelpPopup}></HelpPopup>
      <NoSolutionsPopup isPopupOpen={isNoSolutionsPopupOpen} togglePopup={toggleNoSolutionsPopup}></NoSolutionsPopup>
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
          onDeleteSummaryEdge={onDeleteSummaryEdge}
          onRequireSummaryEdge={onRequireSummaryEdge}
          clearData={clearData}
          roots={roots}
          deletedEdges={deletedEdges}
          requiredEdges={requiredEdges}
          deletedRoots={deletedRoots}
          requiredRoots={requiredRoots}
          setDeletedEdges={setDeletedEdges}
          setRequiredEdges={setRequiredEdges}
          setDeletedRoots={setDeletedRoots}
          setRequiredRoots={setRequiredRoots}
          filterStack={filterStack}
          setFilterStack={setFilterStack}
        /> : <></>}
      <div className={`panel info ${type === 'dualviz' ? 'one' :
        type === 'sumviz' ? 'one two' :
          type === 'triviz' ? 'tri two' :
            ''
        }`}>
        <div className="titlewrapper">
          { multiSoln ?
            <label className="titleelem left" htmlFor="inputs">
              <p><b>{multiSoln && type === 'triviz' ? '' : 'Input Tree: '}
                <select
                  name="inputs"
                  id="inputs"
                  onChange={handleInputChange}
                  value={inputTree}
                >
                  {inputNames.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </b></p>
            </label> : <></>
          }
          <label className="titleelem end" htmlFor="labelings">
            <p><b>{multiSoln && type === 'triviz' ? '' : 'Full Labeling: '}
              <select 
                name="labelings" 
                id="labelings" 
                onChange={handleLabelChange} 
                value={labeling}  // Set the value prop here
              >
                {labelNames.filter(l => multiSoln ? inputData['solution_names'].includes(l) : true).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </b></p>
          </label>
          {/* <h3 className="viztitle"><b>{data["name"]}</b></h3> */}
          {(type !== 'dualviz' && type !== 'triviz' && type !== 'sumviz') ?
            <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p> :
            <></>}
          {type !== 'sumviz' ?
            <span onClick={closeTab.bind(null, 1)} style={{ textDecoration: 'none', color: 'black'}}><p className='panelclosebutton'><b>[X]</b></p></span>
            : <></>}
        </div>
        <div className={coord_map === undefined ? "leftcolumn nolegend" : "leftcolumn"}>
          <div className={`panel migration top ${(type === 'dualviz' || type === 'triviz') ? 'left' : ''}`}>
            <p className="paneltitle"><b>Migration Graph</b></p>
            <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
            <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
            <button type="button" className="paneltitle button" onClick={rotateFn}>Rotate</button>
            <button type="button" className="paneltitle button under" onClick={() => resetFn(1)}>Reset</button>
            <Migration 
              key={refreshCounter} 
              tree={tree} 
              labeling={tree_labeling} 
              coloring={coloring} 
              migration={migration} 
              evtbus={evtBus} 
              rotated={rotate}/>
          </div>
          <div className={`panel migration ${(type === 'dualviz' || type === 'triviz') ? 'left' : ''}`}>
          <p className="paneltitle">
              {origExists ? (
                // If origExists is true, render both Clonal Tree and View Input Tree links
                <>
                  <button
                    style={{ fontWeight: !clonalL ? 'bold' : 'normal' }}
                    onClick={onToggleOutputClonalL}
                  >
                    Clonal Tree
                  </button>{" "}
                  |{" "}
                  <button
                    style={{ fontWeight: clonalL ? 'bold' : 'normal' }}
                    onClick={onToggleInputClonalL}
                  >
                    Input Tree
                  </button>
                </>
              ) : (
                // If origExists is false, render only Clonal Tree (fallback to <b> element)
                <b>Clonal Tree</b>
              )}
            </p>
            <button type="button" className="paneltitle button clonal" onClick={() => resetClonal(1)}>Reset</button>
            <ClonalTree 
              key={refreshCounter} 
              tree={!clonalL ? tree : multiSoln ? inputData['tree'] : originalTree} 
              labeling={!clonalL ? tree_labeling : multiSoln ? inputData['labeling'] : originalLabeling} 
              coloring={coloring} 
              evtbus={evtBus} 
              rightcol={type === 'sumviz' || type === 'triviz'} 
              index={1}
              clonalMap={clonalMap}
              clonal={clonalL}/>
          </div>
        </div>
      </div>
      {(type === 'dualviz' || type === 'triviz') ?
        <div className={`panel info ${type === 'dualviz' ? 'one two' : 'tri three'}`}>
          <div className="titlewrapper">
            { multiSoln ?
              <label className="titleelem left" htmlFor="inputs">
                <p><b>{multiSoln && type === 'triviz' ? '' : 'Input Tree: '}
                  <select
                    name="inputs"
                    id="inputs"
                    onChange={handleInputChange2}
                    value={inputTree2}
                  >
                    {inputNames.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </b></p>
              </label> : <></>
            }
            <label className="titleelem left" htmlFor="labelings">
              <p><b>{multiSoln && type === 'triviz' ? '' : 'Full Labeling: '}
                <select 
                  name="labelings" 
                  id="labelings" 
                  onChange={handleLabelChange2}
                  value={labeling2}  // Set the value prop here
                >
                  {labelNames.filter(l => multiSoln ? inputData2['solution_names'].includes(l) : true).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </b></p>
            </label>
            {/* <h3 className="viztitle"><b>{data2["name"]}</b></h3> */}
            <span onClick={closeTab.bind(null, 2)} style={{ textDecoration: 'none', color: 'black' }}><p className='panelclosebutton'><b>[X]</b></p></span>
          </div>
          <div className={coord_map === undefined ? "leftcolumn nolegend" : "leftcolumn"}>
            <div className={`panel migration top ${(type === 'dualviz' || type === 'triviz') ? 'left' : ''}`}>
              <p className="paneltitle"><b>Migration Graph</b></p>
              <p className="paneltitle mu">{`\u03BC: ${mu2}`}</p>
              <p className="paneltitle gamma">{`\u03B3: ${gamma2}`}</p>
              <button type="button" className="paneltitle button" onClick={rotateFn2}>Rotate</button>
              <button type="button" className="paneltitle button under" onClick={() => resetFn(2)}>Reset</button>
              <Migration 
                key={refreshCounter} 
                tree={tree2} 
                labeling={tree_labeling2} 
                coloring={coloring} 
                migration={migration2} 
                evtbus={evtBus} 
                rightcol={true} 
                rotated={rotate2}/>
            </div>
            <div className={`panel migration ${(type === 'dualviz' || type === 'triviz') ? 'left' : ''}`}>
              <p className="paneltitle">{origExists ? (
                // If origExists is true, render both Clonal Tree and View Input Tree links
                <>
                  <button
                    style={{ fontWeight: !clonalR ? 'bold' : 'normal' }}
                    onClick={onToggleOutputClonalR}
                  >
                    Clonal Tree
                  </button>{" "}
                  |{" "}
                  <button
                    style={{ fontWeight: clonalR ? 'bold' : 'normal' }}
                    onClick={onToggleInputClonalR}
                  >
                    Input Tree
                  </button>
                </>
              ) : (
                // If origExists is false, render only Clonal Tree (fallback to <b> element)
                <b>Clonal Tree</b>
              )}</p>
              <button type="button" className="paneltitle button clonal" onClick={() => resetClonal(2)}>Reset</button>
              <ClonalTree 
                key={refreshCounter} 
                tree={!clonalR ? tree2 : multiSoln ? inputData2['tree'] : originalTree} 
                labeling={!clonalR ? tree_labeling2 : multiSoln ? inputData2['labeling'] : originalLabeling} 
                coloring={coloring} 
                evtbus={evtBus} 
                rightcol={true} 
                index={2}
                clonalMap={clonalMap2}
                clonal={clonalR}/>
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