import React from 'react';
import { useState, useEffect, useRef } from 'react'
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';

var cyCanvas = require('cytoscape-canvas');

Cytoscape.use(cyCanvas);
Cytoscape.use(dagre);
Cytoscape.use(COSEBilkent);

function MigrationMap(props) {
    const [canvheight, setCanvHeight] = useState(0)
    const [disp, setDisp] = useState(false);
    let count = 0;

    var hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

    var findCoords = (nodeId) => {
        let found = props.coord_map.filter(coord => coord[0] == findLabel(nodeId))[0];
        return {x: found[1][1]+15, y: found[1][0]+30}
    }

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

    const [width, setWith] = useState("100%");
    const [height, setHeight] = useState("100%");

    function onlyUnique(value, index, array) {
        return array.indexOf(value) === index;
    }

    function findLabel(node) {
        return props.labeling.map((value, index) => {
            if (value[0] === node) return value[1]}).filter((item) => {return item != undefined})[0];
    }

    function getColor(label) {
        let color = props.coloring.map((value, index) => {
            if (value[0] === label) return value[1]}).filter((item) => {return item != undefined})[0];
        if (color === undefined) {
            return '#ffffff'
        }
        return hexColorRegex.test(color) ? color : colorPalette[parseInt(color) % ncolors]
    }

    let nodes = props.tree.flat().filter(onlyUnique).map((value, index) => {
    return { data: { id:  findLabel(value), label: findLabel(value), type: "ip" }, position: findCoords(value) };
    });
    //nodes.push({data: {id: 'dummy', label: 'dummy', type: "dummy"}, position: {x: 0, y:0}})
    let edges_t = props.tree.map((value, index) => {
        return { data: { source: findLabel(value[0]), target: findLabel(value[1]), label: 1, id: `${findLabel(value[0])}->${findLabel(value[1])}`, type:"actual"} }
    })

    let edges = [];

    for (const [i, edge] of edges_t.entries()) {
        let flag = false;
        for (const [j, edge2] of edges.entries()) {
            if (edge.data.source == edge2.data.source && edge.data.target == edge2.data.target) {
                edges[j].data.label++;
                flag = true;
                break;
            }
        }
        if (!flag && edge.data.source !== edge.data.target) edges.push(edges_t[i]);
    }

    for (const [i, edge] of edges.entries()) {
        if (edge.data.label == 1) {
            edges[i].data.label = "";
        }
    }

    const [graphData, setGraphData] = useState({
        nodes: nodes,
        edges: edges
    });

    let styleSheet = [
        {
            selector: "node",
            style: {
                backgroundColor: "#ffffff",
                width: 10,
                height: 10,
                // label: "data(id)",
                // "width": "mapData(score, 0, 0.006769776522008331, 20, 60)",
                // "height": "mapData(score, 0, 0.006769776522008331, 20, 60)",
                // "text-valign": "center",
                // "text-halign": "center",
                "overlay-padding": "6px",
                "z-index": "10",
                //text props
                //"text-outline-color": "#4a56a6",
                //"text-outline-width": "2px",
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
          selector: "node[type='device']",
          style: {
            shape: "rectangle"
          }
        },
        {
          selector: "edge",
          style: {
            width: 7,
            // "line-color": "#6774cb",
            label: "data(label)",
            "target-arrow-color": "#6774cb",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "text-outline-width": "2px",
            color: "white",
            fontSize: 15
          }
        },
        {
            selector: "edge[type='label']",
            style: {
                width: 2,
                "curve-style": "haystack"
            }
        },
        {
            selector: "node[type='label']",
            style: {
                width: 2,
                height: 2
            }
        },
        {
            selector: "edge[type='label']",
            style: {
                "line-color": '#bbb'
            }
        }
    ];

    props.coloring.map((value, index) => {
        styleSheet.push({
          selector: `node[label='${value[0]}']`,
          style: {
            backgroundColor: hexColorRegex.test(value[1]) ? value[1] : colorPalette[parseInt(value[1]) % ncolors]
          }
        })
    })

    edges.map((value, index) => {
        if (value.data.type === "actual") {
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
        }
    })

    let myCyRef;
    const layout = {
        name: "preset",
        fit: false,
        // circle: true,
        // directed: true,
        // padding: 50,
        // spacingFactor: 1.5,
           animate: true,
           animationDuration: 1000,
        // avoidOverlap: true,
        // nodeDimensionsIncludeLabels: false
    };

    useEffect(() => {
        props.coord_map.map((l, index) => {
            nodes.push({
                data: {
                    id: `labelnode${index}`,
                    label: `labelnode${index}`,
                    type: "label"
                },
                position: {
                    x: index % 2 == 0 ? 5 : 310,
                    y: (index + 1)*Math.floor(canvheight/(props.coord_map.length)/1.75)
                }
            })
            edges.push({
                data: {
                    source: `labelnode${index}`,
                    target: l[0],
                    label: 1,
                    id: `labelnode${index}->${l[0]}`,
                    type: "label"
                }
            })
        })

        for (const [i, edge] of edges.entries()) {
            if (edge.data.label == 1) {
                edges[i].data.label = "";
            }
        }

        setGraphData({
            nodes: nodes,
            edges: edges
        })

        setDisp(true);
    }, [canvheight])

    document.addEventListener("DOMContentLoaded", function(event) { 
        let canv = document.querySelector('.migrationmap')
        setCanvHeight(canv.offsetHeight);
    });

    return <CytoscapeComponent
        className='migrationmap'
        elements={CytoscapeComponent.normalizeElements(graphData)}
        // pan={{ x: 200, y: 200 }}
        style={{ width: width, height: height }}
        zoomingEnabled={true}
        maxZoom={3}
        minZoom={0.1}
        autounselectify={false}
        boxSelectionEnabled={true}
        layout={layout}
        stylesheet={styleSheet}
        cy={cy => {
          myCyRef = cy;

          //var layer = cy.cyCanvas();
          //var canvas = layer.getCanvas();
          //var ctx = canvas.getContext('2d');


          cy.userZoomingEnabled( false );
          cy.userPanningEnabled( false );
          cy.nodes().ungrabify();

          cy.nodes().forEach(function(node) {
            var pos = node.position();
            if (node.data().type === 'label') {
                pos.y /= 75
                //pos.y *= canvheight/(props.coord_map.length*2)
                pos.y *= Math.floor(canvheight/(props.coord_map.length))
            }
          });
    
          cy.on("tap", "node", evt => {
            var node = evt.target;
          });

          cy.on('mouseover', "edge[type='actual']", function(event) {
            const { target } = event;
            target.css({
              width: 10
            })
            const nodeId = event.target.id();
            //props.evtbus.fireEvent('selectNodeCl', { nodeId, target});
          });

          cy.on('mouseover', "node[type='ip']", function(event) {
            const { target } = event;
            target.css({
                width: 15,
                height: 15,
            })
            const nodeId = event.target.id();
            //props.evtbus.fireEvent('hoverNodeCl', { nodeId });

            var node = event.target;
            var label = node.data('label');

            var labeltag = document.querySelector(`#${label}`);
            if (labeltag !== null) {
              labeltag.style.opacity = 1;
              labeltag.style.zIndex = 100;
              labeltag.style.fontWeight = 'bold';
            }
          })

          cy.on('mouseout', "node[type='ip']", function(event) {
            const { target } = event;
            target.css({
                width: 10,
                height: 10,
            })
            const nodeId = event.target.id();
            //props.evtbus.fireEvent('dehoverNodeCl', { nodeId });

            var node = event.target;
            var label = node.data('label');

            var labeltag = document.querySelector(`#${label}`);
            if (labeltag !== null) {
              labeltag.style.opacity = 0.7;
              labeltag.style.zIndex = 1;
              labeltag.style.fontWeight = 'normal';
            }
          })
    
          cy.on('mouseout', "edge[type='actual']", function(event) {
            const { target } = event;
            target.css({
              width: 7
            })
            const nodeId = event.target.id();
            //props.evtbus.fireEvent('deselectNodeCl', { nodeId, target});
          });

          const positions = {};
            cy.nodes().forEach((node) => {
                positions[node.data().id] = node.position();
          });

          if (disp) {
            cy.nodes().forEach((node) => {
                count++;
                if (node.data().type === 'label' && node.renderedPosition('y') > 0) {
                    let index = parseInt(node.data().id.slice(-1));
                    let label = props.coord_map[index][0]

                    var div = document.createElement("div");
                    div.setAttribute("class", "panel label");

                    div.innerHTML = `<ul className="legendlist"><li><span><p>${label}</p></span></li></ul>`;
                
                    // Position the div element near the node
                    const canvas = document.querySelector('.rightcolumn');
                    div.style.position = "absolute";
                    
                    let leftPos = `calc(${node.renderedPosition('x') + 'px'} + 70% + 20px `
                    if (index % 2 == 1) {
                        leftPos += "- 100px";
                    }
                    leftPos += ")";

                    div.id = label;

                    div.style.top = (node.renderedPosition('y') + canvas.getBoundingClientRect().top/2 - 15) + 'px';
                    div.style.left = leftPos; 
                    div.style.opacity = 0.7;

                    document.body.appendChild(div);
                }
            })
          }
        }}
        abc={console.log("myCyRef", myCyRef)}
    />
}

export default MigrationMap;