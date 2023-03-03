import React from 'react';
import { useState } from "react";
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';

Cytoscape.use(COSEBilkent);

function Migration(props) {
    const colorPalette = [
        "#fff5ba",
        "#ffcbc1",
        "#e7ffac",
        "#85e3ff",
        "#a79aff",
        "#d5aaff",
        "#f6a6ff",
        "#aff8d8",
        "#ffc9de",
        "#ffabab"
      ]
    
      const [width, setWith] = useState("100%");
      const [height, setHeight] = useState("100%");
    
      function onlyUnique(value, index, array) {
        return array.indexOf(value) === index;
      }
    
      function findLabel(node) {
        return props.labeling.map((value, index) => {
          if (value[0] === node) return value[1]}).filter((item) => {return item != undefined})[0];
      }
    
      let nodes = props.tree.flat().filter(onlyUnique).map((value, index) => {
        return { data: { id:  findLabel(value), label: findLabel(value), type: "ip"} };
      });
      let edges_t = props.tree.map((value, index) => {
        return { data: { source: findLabel(value[0]), target: findLabel(value[1]), label: 1} }
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
        if (!flag) edges.push(edges_t[i]);
      }

      for (const [i, edge] of edges.entries()) {
        if (edge.data.label == 1) {
          edges[i].data.label = "";
        }
      }

      console.log(edges);
    
      const [graphData, setGraphData] = useState({
        nodes: nodes,
        edges: edges
      });
    
      const layout = {
        name: "breadthfirst",
        fit: true,
        circle: true,
        directed: true,
        padding: 50,
        // spacingFactor: 1.5,
        animate: true,
        animationDuration: 1000,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false
      };
    
      let styleSheet = [
        {
          selector: "node",
          style: {
            backgroundColor: "#4a56a6",
            width: 15,
            height: 15,
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
            width: 3,
            // "line-color": "#6774cb",
            label: "data(label)",
            "line-color": "#AAD8FF",
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
            backgroundColor: colorPalette[parseInt(value[1])]
          }
        })
      })
    
      let myCyRef;
    
      return <CytoscapeComponent
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
    
          console.log("EVT", cy);
    
          cy.on("tap", "node", evt => {
            var node = evt.target;
            console.log("EVT", evt);
            console.log("TARGET", node.data());
            console.log("TARGET TYPE", typeof node[0]);
          });
        }}
        abc={console.log("myCyRef", myCyRef)}
      />
}

export default Migration;