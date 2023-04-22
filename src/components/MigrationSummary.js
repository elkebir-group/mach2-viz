import React from 'react';
import { useState } from "react";
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';

Cytoscape.use(dagre);
Cytoscape.use(COSEBilkent);

function MigrationSummary(props) {
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

    let trees = props.data["solutions"].map(item => item["tree"]);
    let tree = [].concat(...trees);
    console.log(tree);

    return <></>
}

export default MigrationSummary;