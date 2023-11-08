function InfoPanel(props) {
    let handleLabelChange = (event) => {
        props.insertParam("labeling", event.target.value);
        props.setLabeling(event.target.value)
        props.setData(props.wholeData["solutions"].filter((item) => {return item["name"] === event.target.value})[0]);
    }

    let closeTab = (tabIndex) => {
        if (type === 'dualviz' || type === 'triviz') {
          setType(type === 'dualviz' ? 'viz' : 'sumviz')
          //console.log(tabIndex)
          if (tabIndex == 1) {
            setData(data2)
            setLabeling(labeling2)
            setRotate(rotate2)
            setTree(data2["tree"])
            setTreeLabeling(data2["labeling"])
            setMigration(data2["migration"])
          }
          insertParam('type', 'viz')
        } else {
          window.location = `${window.location.protocol}//${window.location.host}/mach2-viz/#/`
        }
    }

    return (
        <div className={`panel info ${
            props.type === 'dualviz' ? 'one' : 
            props.type === 'sumviz' ? 'one two' :
            props.type === 'triviz' ? 'tri two' :
            ''
          }`}>
          <div className="titlewrapper">
            <label className="titleelem left" for="labelings"><p><b>Full Labeling:
              <select name="labelings" id="labelings" onChange={handleLabelChange}>
                {props.labelnames.map(l => 
                  {return (l === props.labeling) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                )}
              </select>
            </b></p></label>
            <h3 className="viztitle"><b>{props.data["name"]}</b></h3>
            {(props.type !== 'dualviz' && props.type !== 'triviz' && props.type !== 'sumviz') ?
              <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p> :
              <></>}
            {props.type !== 'sumviz' ? 
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
    )
}