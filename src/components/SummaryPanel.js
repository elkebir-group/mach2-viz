import React, { useState, useEffect, useContext } from "react"
import SummaryGraph from "./SummaryGraph.js";

function SummaryPanel({ type, setType, insertParam, wholeData, coloring, muSum, gammaSum, evtBus, setEvtBus, onSummaryEdgeTapped}) {
    let closeSummary = (event) => {
        if (type === 'sumviz') {
            setType('viz')
            insertParam('type', 'viz')
        } else {
            setType('dualviz')
            insertParam('type', 'dualviz')
        }
    }

    const summaryGraph = wholeData["summary"]["migration"]
    
    let coloringDict = {};
    for (var i = 0; i < coloring.length; i++) {
        coloringDict[coloring[i][0]] = coloring[i][1];
    }

    return (
        <div className={`panel info ${type === 'sumviz' ? 'one' : 'tri'}`}>
            <div className="titlewrapper">
                <h3 className="viztitle"><b>Summary</b></h3>
                <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                <a onClick={closeSummary} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
            </div>
            <div className="panel migration top left sum">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <p className="paneltitle mu">{`\u03BC: ${muSum}`}</p>
                <p className="paneltitle gamma">{`\u03B3: ${gammaSum}`}</p>
                <SummaryGraph 
                    data={summaryGraph} 
                    coloringDict={coloringDict} 
                    evtbus={evtBus} 
                    title={wholeData['name']} 
                    setEvtBus={setEvtBus}
                    onSummaryEdgeTapped={onSummaryEdgeTapped}
                />
            </div>
        </div> 
    )
}

export default SummaryPanel;