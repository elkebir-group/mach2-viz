import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Migration from "./Migration.js";
import ClonalTree from "./ClonalTree.js";

function MigrationPanel({type, setType, handleLabelChange, labeling, labelNames, data, closeTab, gamma, mu, rotateFn, tree, tree_labeling, coloring, migration, evtBus, rotate, coord_map}) {
    return (
        <div>
            <div className="titlewrapper">
                <label className="titleelem left" for="labelings"><p><b>Full Labeling:
                <select name="labelings" id="labelings" onChange={handleLabelChange}>
                    {labelNames.map(l => 
                    {return (l === labeling) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                    )}
                </select>
                </b></p></label>
                <h3 className="viztitle"><b>{data["name"]}</b></h3>
                {(type !== 'dualviz' && type !== 'triviz' && type !== 'sumviz') ?
                <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p> :
                <></>}
                {type !== 'sumviz' ? 
                <Link onClick={closeTab.bind(null, 1)} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></Link>
                : <></>}
            </div>
            <div className={coord_map === undefined ? "leftcolumn nolegend" : "leftcolumn"}>
                <div className={`panel migration top ${(type === 'dualviz' || type === 'triviz') ? 'left' : ''}`}>
                    <p className="paneltitle"><b>Migration Graph</b></p>
                    <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
                    <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
                    <button type="button" className="paneltitle button" onClick={rotateFn}>Rotate</button>
                    <Migration tree={tree} labeling={tree_labeling} coloring={coloring} migration={migration} evtbus={evtBus} rotated={rotate}/>
                </div>
                <div className={`panel migration ${(type === 'dualviz' || type === 'triviz') ? 'left': ''}`}>
                    <p className="paneltitle"><b>Clonal Tree</b></p>
                    <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={evtBus}/>
                </div>
            </div>

        </div>

    );
}

export default MigrationPanel;