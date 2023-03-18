import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import { compressUrlSafe } from '../utils/lzma-url.js'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import A7 from "../samples/A7/A7.json";
import patient1 from "../samples/patient1/patient1.json"

function readFile(patient) {
    if (patient === "A7") {
      return A7;
    } else {
      return patient1;
    }
}

function Home() {
    var default_patients = ["A7", "patient1"]
    var div_elements = []
    var which_color = true;
    const color1 = "#A3A3A3";
    const color2 = "#EBEBEB";
    
    for (let i = 0; i < default_patients.length; i++) {
        var current_patient = default_patients[i];
        var current_color = (which_color ? color1 : color2)
        var json_contents = readFile(current_patient);

        let labelnames = json_contents["clone_tree"]["labeling"].map((value, index) => {return value["name"]});

        var link = `viz?data=${compressUrlSafe(JSON.stringify(json_contents, null, 4))}&labeling=${labelnames[0]}`

        div_elements.push(<div className="patientitem" style={{ backgroundColor: current_color }}><Link to={link} style={{ textDecoration: 'none', color: 'black'}}><li className="abouttext">{current_patient}</li></Link></div>)
        which_color = !which_color;
    }

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
            <div className='panel home'>
                <h1><b>Welcome to MACHINA-Viz!</b></h1>
                <div className="aboutdir"><Link to="about" style={{ textDecoration: 'none', color: 'black'}}><h4 className='abouttext'>About</h4></Link></div>
                <h3>Examples</h3>
                <p><b>TODO: Insert examples table here</b></p>

                <div className="panel example">
                    <ol className="patientlist">
                      { 
                        div_elements.map(elem => (
                          elem
                        ))
                      }
                    </ol>
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