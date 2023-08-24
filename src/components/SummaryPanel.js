import React, { useState } from "react"
import SummaryGraph from "./SummaryGraph.js";

function SummaryPanel({ 
    type, 
    setType, 
    insertParam, 
    usedData, 
    coloring, 
    muSum, 
    evtBus, 
    onDeleteSummaryEdge, 
    onRequireSummaryEdge, 
    clearData, 
    roots, 
    deletedEdges,
    requiredEdges,
    deletedRoots,
    requiredRoots,
    setDeletedEdges,
    setRequiredEdges,
    setDeletedRoots,
    setRequiredRoots,
    filterStack,
}) {
    const [tooltip, setTooltip] = useState(false);

    let closeSummary = (event) => {
        clearData()
        if (type === 'sumviz') {
            setType('viz')
            insertParam('type', 'viz')
        } else {
            setType('dualviz')
            insertParam('type', 'dualviz')
        }
    }

    function findColor(dict, key) {
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

        let value = dict[key];

        return hexColorRegex.test(value) ? value : colorPalette[parseInt(value) % ncolors];
    }

    function generateTag(stack, dict) {
        if (stack.length <= 0) {
            return <></>
        }

        const recentAction = stack[stack.length - 1];
        let split = recentAction.split(' ')
        let edge = split[split.length - 1]
        let [source, target] = edge.split('->')
        let sourceColor = findColor(dict, source);
        let targetColor = findColor(dict, target);

        console.log(findColor(dict, source));

        const sourceStyle = {
            display: 'inline-block',
            backgroundColor: sourceColor,
            padding: '5px',
            borderRadius: '5px',
            color: 'white',
        };

        const targetStyle = {
            display: 'inline-block',
            backgroundColor: targetColor,
            padding: '5px',
            borderRadius: '5px',
            color: 'white',
        };

        return (
            <div className="panel actionwrapper">
                <p><b>Undo Most Recent Action: </b></p>
                <p className="recentAction">{split[0]} {split[1]}</p>
                <p className="recentAction"><span style={sourceStyle}>{source}</span> <span style={targetStyle}>{target}</span></p>
            </div>
        )
    }

    function undoFunction() {
        let recent = filterStack.pop()
        let [action, item, object] = recent.split(' ')

        if (action === 'required') {
            if (item === 'root') {
                setRequiredRoots(requiredRoots.filter(elem => elem !== object))
            }

            if (item === 'edge') {
                setRequiredEdges(requiredEdges.filter(elem => elem !== object))
                evtBus.fireEvent('unrequireEdge', { object })
            }
        }

        if (action === 'deleted') {
            if (item === 'root') {
                setDeletedRoots(deletedRoots.filter(elem => elem !== object))
            }

            if (item === 'edge') {
                setDeletedEdges(deletedEdges.filter(elem => elem !== object))
            }
        }

        console.log(action)
        console.log(item)
        console.log(object)
    }

    var summaryGraph = usedData["summary"]["migration"];

    if (summaryGraph === undefined) {
        summaryGraph = usedData["summary"]
    }

    let coloringDict = {};
    for (var i = 0; i < coloring.length; i++) {
        coloringDict[coloring[i][0]] = coloring[i][1];
    }

    return (
        <div className={`panel info ${type === 'sumviz' ? 'one' : 'tri'}`}>
            <div className="titlewrapper">
                <h3 className="sumviztitle"><b>Summary</b></h3>
                <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                <span onClick={closeSummary} style={{ textDecoration: 'none', color: 'black' }}><p className='panelclosebutton'><b>[X]</b></p></span>
            </div>
            <div className="panel migration top left sum">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <p className="paneltitle mu">{`solutions: ${usedData['solutions'].length}`}</p>
                {filterStack.length > 0 ? <p 
                    className="rightAlign"
                    onClick={undoFunction}
                    onMouseEnter={() => setTooltip(true)}
                    onMouseLeave={() => setTooltip(false)}
                >↩</p> : <></>}
                {tooltip ? generateTag(filterStack, coloringDict) : <></>}
                <SummaryGraph
                    data={summaryGraph}
                    coloringDict={coloringDict}
                    evtbus={evtBus}
                    title={usedData['name']}
                    onDeleteSummaryEdge={onDeleteSummaryEdge}
                    onRequireSummaryEdge={onRequireSummaryEdge}
                    roots={roots}
                    requiredEdges={requiredEdges}
                />
            </div>
        </div>
    )
}

export default SummaryPanel;