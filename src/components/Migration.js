import React, { useEffect, useMemo } from 'react'
import { useState } from "react";
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';

Cytoscape.use(dagre);
Cytoscape.use(COSEBilkent);

/** Migration graph showing the anatomical cancer metastases
 * 
 * @param {*} props 
 * - labeling:  anatomic labeling for the nodes
 * - coloring:  coloring scheme
 * - tree:      clonal tree edgelist
 * - migration: precomputed migration graph
 * - rightcol:  Is this a dualviz right column migration graph?
 * - rotated:   Is the graph rotated?
 * @returns JSX/HTML
 */
function Migration(props) {
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
        return hexColorRegex.test(color) ? color : colorPalette[parseInt(color) % ncolors]
      }
    
      // The difference between this and the Clonal Tree is that the nodes are anatomical locations instead of clones
      let nodes = props.tree.map(array => {
        // Create a new array excluding the third element
        return array.filter((_, index) => index !== 2);
      }).flat().filter(onlyUnique).map((value, index) => {
        return { data: { id:  findLabel(value), label: findLabel(value), type: "ip"} };
      });
      let edges = props.migration.map((value, index) => {
        return { data: { source: value[0], target: value[1], label: value[2], id: `${value[0]}->${value[1]}`, clsource: value[0], cltarget: value[1] } }
      })
      for (const [i, edge] of edges.entries()) {
        if (edge.data.label == 1) {
          edges[i].data.label = "";
        }
      }
    
      const [graphData, setGraphData] = useState({
        nodes: nodes,
        edges: edges
      });

      // Likewise switch the graph data when any of the props values change
      useEffect(() => {
        let nodes = props.tree.map(array => {
          // Create a new array excluding the third element
          return array.filter((_, index) => index !== 2);
        }).flat().filter(onlyUnique).map((value, index) => {
          return { data: { id:  findLabel(value), label: findLabel(value), type: "ip"} };
        });
        let edges = props.migration.map((value, index) => {
          return { data: { source: value[0], target: value[1], label: value[2], id: `${value[0]}->${value[1]}`, clsource: value[0], cltarget: value[1] } }
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
      }, [props.tree, props.labeling, props.migration, props.rotated])

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
    
            // "width": "mapData(score, 0, 0.006769776522008331, 20, 60)",
            // "height": "mapData(score, 0, 0.006769776522008331, 20, 60)",
            // "text-valign": "center",
            // "text-halign": "center",
            "overlay-padding": "6px",
            "z-index": "10",
            //text props
            //"text-outline-color": "#4a56a6",
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
            width: 3,
            // "line-color": "#6774cb",
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

      props.coloring.map((value, index) => {
        styleSheet.push({
          selector: `node[label='${value[0]}']`,
          style: {
            'border-color': hexColorRegex.test(value[1]) ? value[1] : colorPalette[parseInt(value[1]) % ncolors]
          }
        })
      })

      edges.map((value, index) => {
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
      })
    
      let myCyRef;

      // Is the migration graph rotated?
      const queryParameters = new URLSearchParams(window.location.hash.split("?")[1]);
      let rotated = props.rightcol ? queryParameters.get("rotated2") === "true" : queryParameters.get("rotated") === "true";
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

        // Position the nodes based on the rotated parameter
        transform: (node, position) => {
          return {
            x: props.rotated ? -2*position.y : position.x,
            y: props.rotated ? position.x : position.y
          }
        },

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
            if (eventName === 'selectNodeSum') {
              const edge = myCyRef.getElementById(eventData.nodeId);
              myCyRef.$(`edge[id='${eventData.nodeId}']`).css({
                width: 10
              })
              edge.trigger('select');
            }
            if (eventName === 'deselectNodeSum') {
              const edge = myCyRef.getElementById(eventData.nodeId);
              myCyRef.$(`edge[id='${eventData.nodeId}']`).css({
                width: 3
              })
              edge.trigger('select');
            }
            if (eventName === 'hoverNodeSum') {
              const edge = myCyRef.getElementById(eventData.nodeId);
              myCyRef.$(`node[id='${eventData.nodeId}']`).css({
                'border-width': 20,
              })
              edge.trigger('select');
            }
            if (eventName === 'dehoverNodeSum') {
              const edge = myCyRef.getElementById(eventData.nodeId);
              myCyRef.$(`node[id='${eventData.nodeId}']`).css({
                'border-width': 10,
              })
              edge.trigger('select');
            }
          };
          props.evtbus.addListener(listener);
        }
      };

      /** Parameter definitions
       * 
       * Migration Number (Mu):       Sum of the edge weights
       * Comigration Number (Gamma):  Number of unique migrations
       */
      let mu = 0;
      let gamma = edges.length;
      edges.map((edge) => {
        if (edge.data.label == '') {
          mu += 1;
        } else {
          mu += parseInt(edge.data.label);
          //gamma += parseInt(edge.data.label) - 1;
        }
      })

      // Which mu and gamma are we setting (this is for dualviz)
      if (!props.rightcol) {
        sessionStorage.setItem("mu", mu);
        sessionStorage.setItem("gamma", gamma);
      } else {
        sessionStorage.setItem("mu2", mu);
        sessionStorage.setItem("gamma2", gamma);
      }
    
      const memoizedGraphComponent = useMemo(() => ( <CytoscapeComponent
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

          cy.on('mouseover', 'edge', function(event) {
            const { target } = event;
            target.css({
              width: 10
            })
            const nodeId = event.target.id();
            props.evtbus.fireEvent('selectNodeCl', { nodeId, target});
          });

          cy.on('mouseover', 'node', function(event) {
            const { target } = event;
            target.css({
              'border-width': 20,
            })
            const nodeId = event.target.id();
            props.evtbus.fireEvent('hoverNodeCl', { nodeId });

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
            props.evtbus.fireEvent('dehoverNodeCl', { nodeId });

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
            props.evtbus.fireEvent('deselectNodeCl', { nodeId, target});
          });
        }}
        abc={console.log("myCyRef", myCyRef)}
        />), [graphData] )
        return memoizedGraphComponent;
}

export default Migration;