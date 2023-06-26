import React, { useState, useEffect, useContext } from "react"
import SummaryGraph from "./SummaryGraph.js";

function SummaryPanel(props) {
    let closeSummary = (event) => {
        if (props.type === 'sumviz') {
            props.setType('viz')
            props.insertParam('type', 'viz')
        } else {
            props.setType('dualviz')
            props.insertParam('type', 'dualviz')
        }
    }

    const summaryGraph = props.wholeData["summary"]["migration"]

    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log(count); // Logging the count when it changes
    }, [count]);

    const onSummaryEdgeTapped = (edge_id) => {
        // let index = -1;
        // for (let i = 0; i < unusedEdges.length; i++) {
        //   if (unusedEdges[i] == edge_id){
        //     index = i;
        //     break;
        //   }
        // }
  
        // if (index == -1) {
        //   console.log("index is -1");
        //   setUnusedEdges(unusedEdges => [...unusedEdges, edge_id]);
        // }
        setCount(count + 1);
    }

    // TODO: Change all pages to use dict?
    let coloringDict = {};
    for (var i = 0; i < props.coloring.length; i++) {
        coloringDict[props.coloring[i][0]] = props.coloring[i][1];
    }

    return (
        <div className={`panel info ${props.type === 'sumviz' ? 'one' : 'tri'}`}>
            <div className="titlewrapper">
                <h3 className="viztitle"><b>Summary</b></h3>
                <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p>
                <a onClick={closeSummary} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
            </div>
            <div className="panel migration top left sum">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <p className="paneltitle mu">{`\u03BC: ${props.muSum}`}</p>
                <p className="paneltitle gamma">{`\u03B3: ${props.gammaSum}`}</p>
                <SummaryGraph 
                    data={summaryGraph} 
                    coloringDict={coloringDict} 
                    evtbus={props.evtBus} 
                    title={props.wholeData['name']} 
                    setEvtBus={props.setEvtBus}
                    onSummaryEdgeTapped={onSummaryEdgeTapped}
                />
            </div>
        </div> 
    )
}

export default SummaryPanel;