import React, { useEffect, useMemo } from 'react'
import { useState } from "react";
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

// Load Cytoscape submodules
Cytoscape.use(dagre);

function findCorresponding(clonalMap, currNode, clonal) {
  if (clonal) {
    let corrNodes = [];
    clonalMap.forEach((row) => {
      if (row[1] === currNode) {
        corrNodes.push(row[0]);
      }
    })
    return corrNodes;
  } else {
    clonalMap.forEach((row) => {
      if (row[0] === currNode) {
        return [row[1]];
      }
    })
  }
}

function findCorrespondingAll(clonalMap, currNode) {
  let corrNodes = [];

  clonalMap.forEach((row) => {
    if (row[0] === currNode) {
      corrNodes.push(row[1])
      corrNodes.push(row[0])
    }
    if (row[1] === currNode) {
      corrNodes.push(row[0])
      corrNodes.push(row[1])
    }
  })

  if (corrNodes.length === 0) {
    corrNodes.push(currNode)
  }

  return corrNodes;
}

function getSubtree(tree, nodes) {
  let edges = [];

  tree.forEach((edge) => {
    if (nodes.includes(edge[0]) && nodes.includes(edge[1])) {
      edges.push(edge)
    }
  })

  return edges;
}

function getNodesInTree(tree, ids) {
  let nodes = [...new Set([].concat.apply([], tree))];
  return ids.filter((id) => nodes.includes(id));
}

function dictFromMap(clonalMap) {
  let dict = {};

  clonalMap.forEach((row) => {
    dict[row[0]] = row[1]
  })

  return dict;
}

function labelDict(labeling) {
  let dict = {};

  labeling.forEach((row) => {
    dict[row[0]] = row[1]
  })

  return dict;
}

/** This component contains the clonal tree showing the tumor phylogeny
 * 
 * @param {*} props The JSX props used on this tag
 *  - coloring:         (array) The coloring scheme of the tree
 *  - labeling:         (array) The anatomical labels of each clone
 *  - tree:             (array) The tree topology as an edgelist
 *  - evtbus:           (obj) The event handler that is shared between graph structures
 *  - rightcol:         (boolean) is this tree in the right column (for dual visualizations)
 *  - originalTree:     (array) The original tree topology
 *  - originalLabeling: (array) The original anatomical labeling
 * @returns The JSX/HTML structure of the component
 */
function ClonalTree(props) {
  console.log(props.labeling)

  const width = "100%";
  const height = "100%";

  // Regex to check whether a string is a hex value representing a color
  var hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

  /* Default color palette
  
  Colorings can be specified as either:
  - [node, index (int)]       : The second element is an index (mod length) chosen from the default color palette
  - [node, hex color (string)]: The second element is a custom hex color */
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
  const ncolors = colorPalette.length;

  // DEFINE FUNCTIONS HERE

  /** Given a clonal label, find its corresponding color in the graph
   * 
   * @param {*} label (string) the clonal label
   * @returns the hex value string of the color corresponding to the label
   */
  function getColor(label) {
    // if (!label) return '#000';
    // let color = props.coloring.map((value, index) => {
    //   if (value[0] === label) return value[1]}).filter((item) => {return item != undefined})[0];
    // return hexColorRegex.test(color) ? color : colorPalette[parseInt(color) % ncolors]

    if (!label) return '#000';

    // Check if the label is an array
    if (Array.isArray(label)) {
      // If label is an array of length 0 or > 1, return black
      if (label.length === 0 || label.length > 1) return '#000';

      // If label is a single element, find the corresponding color
      if (label.length === 1) { label = label[0]; }
    }
  
    let colorValue = props.coloring.find(value => value[0] === label);
    
    let color = colorValue ? colorValue[1] : undefined;
  
    return hexColorRegex.test(color) 
      ? color 
      : colorPalette[parseInt(color) % ncolors];
  }

  /** Filter an array into only unique elements*/
  function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

  /** Find corresponding anatomical label of clone
   * 
   * @param {*} node clone ID
   * @returns anatomical location of clone
   */
  function findLabel(node) {
    // return props.labeling.map((value, index) => {
    //   if (value[0] === node) return value[1]}).filter((item) => {return item != undefined})[0];
    let labelPair = props.labeling.find(value => value[0] === node);
  
    return labelPair ? labelPair[1] : undefined;
  }

  // Define the nodes and edges of the graph
  let nodes = props.tree.map(array => {
    // Entry structure in tree [u, v, time] s.t. time is the temporal value of the clonal mutation 
    // Create a new array excluding the third element since 
    return array.filter((_, index) => index !== 2);
  }).flat().filter(onlyUnique).map((value, index) => {
    return { data: { id: value, label: findLabel(value), type: "ip"} };
  });
  let edges = props.tree.map((value, index) => {
    return { data: { source: value[0], target: value[1], label: `${value[0]}->${value[1]}`, migration: `${findLabel(value[0])}->${findLabel(value[1])}`} }
  })

  // Set the graph as a React state
  const [graphData, setGraphData] = useState({
    nodes: nodes,
    edges: edges
  });

  const [origDict, setOrigDict] = useState(dictFromMap(props.clonalMap));

  // Handle graph changes (this is for when we switch the solution)
  useEffect(() => {
    // Reset nodes and labeling
    nodes = props.tree.map(array => {
      return array.filter((_, index) => index !== 2);
    }).flat().filter(onlyUnique).map((value, index) => {
      return { data: { id: value, label: findLabel(value), type: "ip"} }
    });

    edges = props.tree.map((value, index) => {
      return { data: { source: value[0], target: value[1], label: `${value[0]}->${value[1]}`, migration: `${findLabel(value[0])}->${findLabel(value[1])}`} }
    })

    // Set the graph state
    setGraphData({
      nodes: nodes,
      edges: edges
    })

    setOrigDict(dictFromMap(props.clonalMap));
  // Set this change dependent on the tree or labeling change
  }, [props.tree, props.labeling])

  // This is like CSS for the Cytoscape graph
  let styleSheet = [
    {
      selector: "node",
      style: {
        backgroundColor: "#4a56a6",
        width: 15,
        height: 15,
        label: "data(id)",
        "overlay-padding": "6px",
        "z-index": "10",
        "text-outline-width": "2px",
        color: "white",
        fontSize: 15
      }
    },
    {
      selector: "node:selected",
      style: {
        "border-width": "6px",
        "border-color": "#AAD8FF",
        "border-opacity": "0.5",
        "background-color": "#77828C",
        width: 50,
        height: 50,

        //text props
        "text-outline-color": "#77828C",
        "text-outline-width": 8
      }
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#AAD8FF",
        "target-arrow-color": "#6774cb",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier"
      }
    }
  ];

  // Set the coloring dynamically in the stylesheet using the coloring props
  props.coloring.forEach((value, index) => {
    console.log(value)
    styleSheet.push({
      selector: `node[label='${value[0]}']`,
      style: {
        backgroundColor: `${getColor(value[0])}`
      }
    })
  })

  nodes.forEach((value, index) => {
    styleSheet.push({
      selector: `node[id='${value.data.id}']`,
      style: {
        backgroundColor: `${getColor(findLabel(value.data.id))}`
      }
    })
  })

  // Style the edges dynamically via gradients based on the node colors
  edges.forEach((value, index) => {
    let source = value.data.source;
    let target = value.data.target;
    styleSheet.push({
      selector: `edge[label='${source}->${target}']`,
      style: {
        'line-fill': 'linear-gradient',
        'line-gradient-stop-colors': `${getColor(findLabel(source))} ${getColor(findLabel(target))}`,
        'line-gradient-stop-positions': '33% 66%',
        "target-arrow-color": `${getColor(findLabel(target))}`
      }
    })
  })

  // The layout encompasses node positions on load, animations, and events
  let myCyRef;
  const layout = {
    name: "dagre",  // Dagre: Layout graph like a DAG (this is good for trees!)
    fit: true,
    // circle: true,
    directed: true,
    padding: 10,
    // spacingFactor: 1.5,
    animate: true,
    animationDuration: 1000,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: false,
    ready: function() {
      // Event listener
      const listener = (eventName, eventData) => {
        // Respond to event from other graph here
        // When a node ge
        if (eventName === 'selectNodeCl') {
          const node = myCyRef.getElementById(eventData.nodeId);
          myCyRef.$(`edge[migration='${eventData.nodeId}']`).css({
            width: 10
          })
          node.trigger('select');
        }
        if (eventName === 'deselectNodeCl') {
          const node = myCyRef.getElementById(eventData.nodeId);
          myCyRef.$(`edge[migration='${eventData.nodeId}']`).css({
            width: 3
          })
          node.trigger('select');
        }
        if (eventName === 'hoverNodeCl') {
          myCyRef.$(`edge[migration='${eventData.nodeId}->${eventData.nodeId}']`).css({
            width: 10
          })
        }
        if (eventName === 'dehoverNodeCl') {
          myCyRef.$(`edge[migration='${eventData.nodeId}->${eventData.nodeId}']`).css({
            width: 3
          })
        }
        if (eventName === 'selectNodeSC') {
          const node = myCyRef.getElementById(eventData.nodeId);
          let label = eventData.label;

          myCyRef.$(`edge[label='${label}']`).css({
            width: 10
          })
          node.trigger('select');
        }
        if (eventName === 'deselectNodeSC') {
          const node = myCyRef.getElementById(eventData.nodeId);
          let label = eventData.label;

          myCyRef.$(`edge[label='${label}']`).css({
            width: 3
          })
          node.trigger('select');
        }
        if (eventName === 'hoverNodeSC') {
          const node = myCyRef.getElementById(eventData.nodeId);
          let source = eventData.nodeId;

          myCyRef.$(`node[id='${source}']`).css({
            width: 25,
            height: 25
          })
          node.trigger('select');
        }
        if (eventName === 'dehoverNodeSC') {
          const node = myCyRef.getElementById(eventData.nodeId);
          let source = eventData.nodeId;

          myCyRef.$(`node[id='${source}']`).css({
            width: 15,
            height: 15
          })
          node.trigger('select');
        }
        if (eventName === 'resetClonal') {
          let index = eventData.index
          if (index === props.index) {
            setGraphData({
              nodes: nodes,
              edges: edges
            })
          }
        }
        if (eventName === 'clonalHover') {
          let corrNodes = eventData.eventParams;

          if (corrNodes !== undefined) {
            corrNodes.forEach((source) => {
              const node = myCyRef.getElementById(eventData.nodeId);
              myCyRef.$(`node[id='${source}']`).css({
                width: 25,
                height: 25
              })
              node.trigger('select');
            })

            let subtree = getSubtree(props.tree, corrNodes);
            subtree.forEach((edge) => {
              myCyRef.$(`edge[label='${edge[0]}->${edge[1]}']`).css({
                width: 10
              })
            })
          }
        }

        if (eventName === 'clonalDehover') {
          let corrNodes = eventData.eventParams

          if (corrNodes !== undefined) {
            corrNodes.forEach((source) => {
              const node = myCyRef.getElementById(eventData.nodeId);
              myCyRef.$(`node[id='${source}']`).css({
                width: 15,
                height: 15
              })
              node.trigger('select');
            })

            let subtree = getSubtree(props.tree, corrNodes);
            subtree.forEach((edge) => {
              myCyRef.$(`edge[label='${edge[0]}->${edge[1]}']`).css({
                width: 3
              })
            })
          }
        }

        if (eventName === 'zoomClonal') {
          let node = eventData.node
          let corr = getNodesInTree(props.tree, eventData.corr)[0];
          let fetched = myCyRef.$(`node[id='${corr}']`);

          try {
            myCyRef.fit(fetched)
          } catch {
            myCyRef.fit(node)
          }
        }
      };
      props.evtbus.addListener(listener);
    }
  };

  let unobserved = 0;
  let origLabelDict = labelDict(props.originalLabeling);
  let cloneLabelDict = labelDict(props.labeling);

  // Compute the number of unobserved clones
  // First, we count the number of empty labels in the original labeling

  nodes.forEach((value) => {
    let node = value.data.id;
    let origNode = origDict[node];
    
    if (origNode !== undefined) {
      if (!origLabelDict[origNode].includes(cloneLabelDict[node])) {
        unobserved += 1;
        value.data.unobserved = true;
      } else {
        value.data.unobserved = false;
      }
    }
  })

  if (!props.rightcol) {
    sessionStorage.setItem('unobserved', unobserved);
  } else {
    sessionStorage.setItem('unobserved2', unobserved);
  }

  // Memoization: Log the graph layout so that when states change, we dont have to recompute everything
  const memoizedGraphComponent = useMemo(() => ( <CytoscapeComponent
    elements={CytoscapeComponent.normalizeElements(graphData)}
    style={{ width: width, height: height }}
    zoomingEnabled={true}
    maxZoom={3}
    minZoom={0.1}
    autounselectify={true}
    boxSelectionEnabled={true}
    layout={layout}
    stylesheet={styleSheet}
    cy={cy => {
      myCyRef = cy;

      // Here we handle events on the graph
      cy.on('mouseover', 'node', function(event) {
        // Get the node information
        var node = event.target;
        var label = node.data('label');

        // Create the div element
        var div = document.createElement("div");
        div.setAttribute("class", "panel popup");
      
        // Position the div element near the node
        const nodePos = node.position();
        
        // Get the container element
        const container = cy.container();
        const zoomLevel = cy.zoom();

        // Get the container's absolute position on the webpage
        const containerRect = container.getBoundingClientRect();

        div.style.position = "absolute";
        const absoluteX = containerRect.left + nodePos.x * zoomLevel + cy.pan().x + 15;
        const absoluteY = containerRect.top + nodePos.y * zoomLevel + cy.pan().y - 15;

        div.style.top = absoluteY + 'px';
        div.style.left = absoluteX + 'px';

        if (typeof label === 'string') {
          div.innerHTML = `<p>${label}&nbsp;</p>`;

          if (node.data('unobserved')) {
            div.innerHTML += `<p><span style="color: red;">unobserved</span>&nbsp;</p>`;
          }
        } else {
          if (label.length === 0) {
            div.innerHTML = `<p>unobserved&nbsp;</p>`;

            // Make text red if unobserved
            div.style.color = "red";
          } else {
            // Say "This node was observed in:" and list the anatomical locations, with the bullets colored by the label color
            div.innerHTML = `<p>This clone was observed in:&nbsp;</p>`;
            label.forEach((value, index) => {
              div.innerHTML += `<p><span style="color: ${getColor(value)}; font-size: 2em; vertical-align: middle;">&bull;</span> <span style="color: black;">${value}</span></p>`;
            });
          }
        }
      
        // Add the div element to the page
        document.body.appendChild(div);

        const nodeId = event.target.id();

        // Enlarge the node on hover
        props.evtbus.fireEvent('hoverNodeSC', { nodeId });

        if (props.clonalMap.length > 0) {
          let eventParams = findCorresponding(props.clonalMap, nodeId, props.clonal);
          props.evtbus.fireEvent('clonalHover', { eventParams })
        }
      });

      cy.on('mouseout', 'node', function(event){
        // Remove the div element on mouseout
        var div = document.querySelector('.panel.popup');
        if (document.body.contains(div)) {
          document.body.removeChild(div);
        }

        const nodeId = event.target.id();

        // Shrink the node back to size
        props.evtbus.fireEvent('dehoverNodeSC', { nodeId });

        if (props.clonalMap.length > 0) {
          let eventParams = findCorresponding(props.clonalMap, nodeId, props.clonal);
          props.evtbus.fireEvent('clonalDehover', { eventParams })
        }
      });

      cy.on('mouseover', 'edge', function(event) {
        const { target } = event;

        // Enlarge the edge
        target.css({
          width: 10
        })
        const nodeId = event.target.id();
        let source = findLabel(target.data().source);
        let sink = findLabel(target.data().target);
        let label = target.data().label;

        // Widen the edge in the migration graph as well
        props.evtbus.fireEvent('selectNode', { nodeId, source, sink, target});
        props.evtbus.fireEvent('selectNodeSC', { nodeId, source, sink, target, label});
      });

      cy.on('mouseout', 'edge', function(event) {
        const { target } = event;

        // Shrink edge back
        target.css({
          width: 3
        })
        const nodeId = event.target.id();
        let source = findLabel(target.data().source);
        let sink = findLabel(target.data().target);
        let label = target.data().label;

        // Shrink migration edge back
        props.evtbus.fireEvent('deselectNode', { nodeId, source, sink, target});
        props.evtbus.fireEvent('deselectNodeSC', { nodeId, source, sink, target, label});
      });

      cy.on('tap', 'node', (event) => {
        const node = event.target;
        let corr = [...new Set(findCorrespondingAll(props.clonalMap, node.id()))]

        props.evtbus.fireEvent('zoomClonal', { node, corr })

        cy.fit(node)
      });
    }}
    />), [graphData] )
    return memoizedGraphComponent;
}

export default ClonalTree;