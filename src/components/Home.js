import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import { compressUrlSafe } from '../utils/lzma-url.js'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

function Home() {
    let handleChange = (e) => {
        const reader = new FileReader();
        const file = e.target.files[0];
        let json_contents;
    
        reader.onload = function(readerEvt) {
          let jsonString = readerEvt.target.result;
          json_contents = jsonString;
          console.log(json_contents);
    
          const data = JSON.parse(json_contents);
          let labelnames = data["clone_tree"]["labeling"].map((value, index) => {return value["name"]});
    
          window.location = window.location + `viz?data=${compressUrlSafe(json_contents)}&labeling=${labelnames[0]}`;
        }
        // Read the file as a text
        reader.readAsText(file);
    }

    return (
        <div className='home'>
            <div className='homecontain'>
              <div className='panel home'>
                <h1><b>Welcome to MACHINA-Viz!</b></h1>
                <div className="aboutdir"><Link to="about" style={{ textDecoration: 'none', color: 'black'}}><h4 className='abouttext'>About</h4></Link></div>
                <h3>Examples</h3>
                <p><b>TODO: Insert examples table here</b></p>
              </div>
            </div>
            <input 
              type="file"
              id="json_upload" 
              name="json_upload"
              accept="application/JSON"
              onChange={handleChange}/>
            <label for="json_upload"><div id="addnew" className="dot"><h1 className="plus">+</h1><span class="tooltiptext"><b>Upload Patient JSON</b></span></div></label>
        </div>
    );
}

export default Home;