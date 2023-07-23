import React, { useMemo } from 'react'
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';

Cytoscape.use(dagre);
Cytoscape.use(COSEBilkent);

/** For the summary visualizer. Union the migration graphs.
 * 
 * Summary graphs are edge-weighted by the number of solutions that edge appears in.
 * Therefore the max weight is the number of solutions there are
 * 
 * @param {*} props 
 * - title:     Name of the dataset
 * - data:      Full data including all solutions
 * - coloring:  Coloring scheme for the nodes
 * - evtbus
 * @returns 
 */
function SummaryGraph({data, coloringDict, evtbus, title, setEvtBus, onDeleteSummaryEdge, onRequireSummaryEdge, roots}) {

    // TODO: Perhaps change this since we are redoing filtration
    var filterOut = [];
    var filterJson = JSON.parse(sessionStorage.getItem("selected"))
    if (title === filterJson['title']) {
      for (let key in filterJson) {
        if (key !== 'title' && !filterJson[key]) {
          filterOut.push(key.split('→'));
        }
      }
    }

    var hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

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

    function onlyUnique(array) {
      return [...new Set(array)];
    }

    // const [width, setWidth] = useState("100%");
    // const [height, setHeight] = useState("100%");
    const width = "100%";
    const height = "100%";

    let nodeSet = onlyUnique(data.map((value, index) => [value[0], value[1]]).flat())

    let nodes = nodeSet.map((value, index) => {
        return { data: { id:  value, label: value, type: "ip"} };
    });

    let edges = data.filter(e => {
      for (let f of filterOut) {
        if (f[0] === e[0] && f[1] === e[1]) {
          return false;
        }
      }
      return true;
    }).map((value, index) => {
      return { data: { source: value[0], target: value[1], label: value[2], id: `${value[0]}->${value[1]}`, clsource: value[0], cltarget: value[1] } }
    })

    // Insert a dummy node in the graph if there exist multiple clonal roots
    // This node will connect to all edges in the graph
    // Edges to those roots will be weighted by the number of solutions those roots appear in
    if (Object.keys(roots).length > 1) {
      nodes.push({ data: { id: "roots", label: "roots", type: "ip"}});

      for (let root in roots) {
        edges.push({
          data: {
            source: "roots",
            target: root,
            label: roots[root],
            id: `roots->${root}`,
            clsource: "roots",
            cltarget: root
          }
        })
      }
    }

    // Dont label edge weights of 1
    // BTW Edges are weighted by the number of solutions they appear in
    for (const [i, edge] of edges.entries()) {
      if (edge.data.label == 1) {
        edges[i].data.label = "";
      }
    }

    // const [graphData, setGraphData] = useState({
    //     nodes: nodes,
    //     edges: edges
    // });

    let graphData = {
      nodes: nodes,
      edges: edges
    };

    // console.log(graphData)

    let styleSheet = [
        {
          selector: "node",
          style: {
            backgroundColor: "#fff",
            'border-width': 10,
            shape: "rectangle",
            width: 100,
            height: 50,
            label: "data(label)",
            "overlay-padding": "6px",
            "z-index": "10",
            "text-outline-width": "2px",
            color: "white",
            fontSize: 15,
            'text-valign': 'center',
            'text-halign': 'center'
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
            "text-outline-color": "#77828C",
            "text-outline-width": 8
          }
        },
        {
          selector: "node[type='device']",
          style: {
            shape: "rectangle"
          }
        },
        {
          selector: "edge",
          style: {
            width: 3,
            label: "data(label)",
            "target-arrow-color": "#6774cb",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "text-outline-width": "2px",
            color: "white",
            fontSize: 15
          }
        }
    ];

    for (let key in coloringDict) {
      let value = coloringDict[key];
      styleSheet.push({
        selector: `node[label='${key}']`,
        style: {
          'border-color': hexColorRegex.test(value) ? value : colorPalette[parseInt(value) % ncolors]
        }
      });
    }

    edges.map((value, _) => {
        let source = value.data.source;
        let target = value.data.target;
        styleSheet.push({
          selector: `edge[id='${source}->${target}']`,
          style: {
            'line-fill': 'linear-gradient',
            'line-gradient-stop-colors': `${getColor(source)} ${getColor(target)}`,
            'line-gradient-stop-positions': '33% 66%',
            "target-arrow-color": `${getColor(target)}`
          }
        })

        return 0;
    })

    let myCyRef;

    // TODO: Probably remove since theres no rotation button for summary
    const queryParameters = new URLSearchParams(window.location.search);
    let rotated = queryParameters.get("rotatedsum") === "true";
    if (rotated === null) {
        rotated = false;
    }

    const layout = {
        name: "dagre",
        fit: true,
        circle: true,
        directed: true,
        padding: 10,
        // spacingFactor: 1.5,
        animate: true,
        animationDuration: 1000,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false,
        ready: function() {
          const listener = (eventName, eventData) => {
            // Respond to event from other graph here
            // For example:
            if (eventName === 'selectNode') {
              const node = myCyRef.getElementById(eventData.nodeId);
              let source = eventData.source;
              let target = eventData.sink;
              myCyRef.$(`edge[id='${source}->${target}']`).css({
                width: 10
              })
              node.trigger('select');
            }
            if (eventName === 'deselectNode') {
              const node = myCyRef.getElementById(eventData.nodeId);
              let source = eventData.source;
              let target = eventData.sink;
              myCyRef.$(`edge[id='${source}->${target}']`).css({
                width: 3
              })
              node.trigger('select');
            }
          };
          evtbus.addListener(listener);
        }
    };

    // Compute mu and gamma for the summary
    let mu = 0;
    let gamma = edges.length;
    edges.map((edge) => {
      if (edge.data.source !== 'roots') {
        if (edge.data.label == '') {
          mu += 1;
        } else {
          mu += parseInt(edge.data.label);
          //gamma += parseInt(edge.data.label) - 1;
        }
      }

      return 0;
    })

    sessionStorage.setItem("musum", mu);
    sessionStorage.setItem("gammasum", gamma);

    function getColor(label) {
      if (label == "roots") {
        return '#000'
      }
      let color = coloringDict[label];
      return hexColorRegex.test(color) ? color : colorPalette[parseInt(color) % ncolors];
    }

    function onEdgeTapped(edge, action) {
      edge.style ({
        "line-fill": "solid",
        "line-color": "#FFF200",
        "target-arrow-color": "#FFF200",
        // "width": "15",
      });
      if (action === 'require') {
        onRequireSummaryEdge(edge.id());
      } else {
        onDeleteSummaryEdge(edge.id());
      }
    }

    const memoizedGraphComponent = useMemo(() => ( <CytoscapeComponent
        elements={CytoscapeComponent.normalizeElements(graphData)}
        // pan={{ x: 200, y: 200 }}
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

          cy.on("cxttap", "edge", evt => {
            console.log("right clicked")
          });

          cy.on("tap", "edge", evt => {
            let action = "require"
            if (evt.originalEvent.shiftKey) {
              action = "delete"
            }
            var edge = evt.target;
            console.log("edge tapped", action);
            onEdgeTapped(edge, action);
          });

          cy.on('mouseover', 'edge', function(event) {
            const { target } = event;
            target.css({
              width: 10
            })
            // evtbus.fireEvent('selectNodeSum', { nodeId, target});
            // evtbus.fireEvent('selectNodeCl', { nodeId, target});
          });

          cy.on('mouseover', 'node', function(event) {
            const { target } = event;
            target.css({
              'border-width': 20,
            })
            // evtbus.fireEvent('hoverNodeSum', { nodeId });
            // evtbus.fireEvent('hoverNodeCl', { nodeId });

            var node = event.target;
            var label = node.data('label');

            var labeltag = document.querySelector(`#${label}`);
            if (labeltag !== null) {
              labeltag.style.opacity = 1;
              labeltag.style.zIndex = 100;
              labeltag.style.fontWeight = 'bold';
            }
          })

          cy.on('mouseout', 'node', function(event) {
            const { target } = event;
            target.css({
              'border-width': 10,
            })
            const nodeId = event.target.id();
            // evtbus.fireEvent('dehoverNodeSum', { nodeId });
            // evtbus.fireEvent('dehoverNodeCl', { nodeId });

            var node = event.target;
            var label = node.data('label');

            var labeltag = document.querySelector(`#${label}`);
            if (labeltag !== null) {
              labeltag.style.opacity = 0.7;
              labeltag.style.zIndex = 1;
              labeltag.style.fontWeight = 'normal';
            }
          })
    
          cy.on('mouseout', 'edge', function(event) {
            const { target } = event;
            target.css({
              width: 3
            })
            const nodeId = event.target.id();
            // evtbus.fireEvent('deselectNodeSum', { nodeId, target});
            // evtbus.fireEvent('deselectNodeCl', { nodeId, target});
          });
        }}
      />), [data] )
      return memoizedGraphComponent;
}

export default SummaryGraph;