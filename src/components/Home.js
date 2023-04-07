import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import { compressUrlSafe } from '../utils/lzma-url.js'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import URLs from "../default_url.json";
import download from "../assets/download.png";

import A7json from "../samples/A7/A7.json";
import A10json from "../samples/A10/A10.json";
import A22json from "../samples/A22/A22.json";
import A29json from "../samples/A29/A29.json";
import A31json from "../samples/A31/A31.json";
import A32json from "../samples/A32/A32.json";

import patient1json from "../samples/patient1/patient1.json";
import patient2json from "../samples/patient2/patient2.json";
import patient3json from "../samples/patient3/patient3.json";
import patient4json from "../samples/patient4/patient4.json";
import patient7json from "../samples/patient7/patient7.json";
import patient9json from "../samples/patient9/patient9.json";
import patient10json from "../samples/patient10/patient10.json";

function Home() {
  console.log(A7json)
    var file_dict = {
      "A7": A7json,
      "A10": A10json,
      "A22": A22json,
      "A29": A29json,
      "A31": A31json,
      "A32": A32json,
      "patient1": patient1json,
      "patient2": patient2json,
      "patient3": patient3json,
      "patient4": patient4json,
      "patient7": patient7json,
      "patient9": patient9json,
      "patient10": patient10json,
    } 

    var default_patients = ["A7", "A10", "A22", "A29", "A31", "A32", "patient1", "patient2", "patient3", "patient4", "patient7", "patient9", "patient10"]
    var default_dirs = ["hoadley_2016", "gundem_2015", "gundem_2015", "gundem_2015", "gundem_2015", "gundem_2015", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016"]
    var div_elements = []
    var which_color = true;
    const color1 = "#EBEBEB";
    const color2 = "#A3A3A3";
    
    for (let i = 0; i < default_patients.length; i++) {
        var current_patient = default_patients[i];
        var current_directory = default_dirs[i];
        var current_color = (which_color ? color1 : color2)

        var link = URLs[current_patient];

        div_elements.push(<div className="patient-container">
          <div className="patientitem" style={{ backgroundColor: current_color }}>
            <li className="dirtext">
              <p><b>{current_directory}</b></p>
            </li>
          </div>
          <div className="patientitem" style={{ backgroundColor: current_color }}>
            <Link to={link} style={{ textDecoration: 'none', color: 'black'}}>
              <li className="abouttext">
                <div className='liwrapper'>
                  <p className='leftli'><b>{current_patient}</b></p>
                </div>
              </li>
            </Link>
            <a href={`https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/vikramr2/machina-viz/blob/main/src/samples/${current_patient}/${current_patient}.json`} target="_blank" download><img className='rightli' src={download}></img></a>
          </div>
        </div>)
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

                <div className="panel title">
                  <ol className="patientlist">
                    <div className="patient-container">
                      <div className="patientitem" style={{ backgroundColor: "#A3A3A3" }}>
                        <li className="dirtext title">
                          <p className='datasettitle'><b>Dataset</b></p>
                        </li>
                      </div>
                      <div className="patientitem" style={{ backgroundColor: "#A3A3A3" }}>
                        <Link to={link} style={{ textDecoration: 'none', color: 'black'}}>
                          <li className="abouttext title">
                          <p className='datasettitle'><b>Patient</b></p>
                          </li>
                        </Link>
                      </div>
                    </div>
                  </ol>
                </div>

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