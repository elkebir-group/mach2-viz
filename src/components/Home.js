import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import URLs from "../utils/default_url.json";
import download from "../assets/download.png";

import axios from 'axios'
import fileDownload from 'js-file-download'

import A7 from "../samples/A7/A7.json";
import A10 from "../samples/A10/A10.json";
import A22 from "../samples/A22/A22.json";
import A29 from "../samples/A29/A29.json";
import A31 from "../samples/A31/A31.json";
import A32 from "../samples/A32/A32.json";
import patient1 from "../samples/patient1/patient1.json";
import patient2 from "../samples/patient2/patient2.json";
import patient3 from "../samples/patient3/patient3.json";
import patient4 from "../samples/patient4/patient4.json";
import patient7 from "../samples/patient7/patient7.json";
import patient9 from "../samples/patient9/patient9.json";
import patient10 from "../samples/patient10/patient10.json";
import tracerx_res from "../samples/tracerx_res/tracerx_res.json";
import tracerx_res_old from "../samples/tracerx_res_old/tracerx_old_all.json";
import tracerx_res_new from "../samples/tracerx_res_new/tracerx_new_all.json";

function Home(props) {
    let handleDownload = (url, filename) => {
      axios.get(url, {
        responseType: 'blob',
      })
      .then((res) => {
        fileDownload(res.data, filename)
      })
    }

    var json_dict = {
      "A7": A7,
      "A10": A10,
      "A22": A22,
      "A29": A29,
      "A31": A31,
      "A32": A32,
      "patient1": patient1,
      "patient2": patient2,
      "patient3": patient3,
      "patient4": patient4,
      "patient7": patient7,
      "patient9": patient9,
      "patient10": patient10,
      "tracerx_res": tracerx_res,
      "tracerx_res_old": tracerx_res_old,
      "tracerx_res_new": tracerx_res_new
    }

    var default_patients = ["A7", "A10", "A22", "A29", "A31", "A32", "patient1", "patient2", "patient3", "patient4", "patient7", "patient9", "patient10", "tracerx_res", "tracerx_res_old", "tracerx_res_new"]
    var default_dirs = ["hoadley_2016", "gundem_2015", "gundem_2015", "gundem_2015", "gundem_2015", "gundem_2015", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "tracerx", "tracerx", "tracerx"]
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
            <Link to={link} style={{ textDecoration: 'none', color: 'black'}} onClick={() => {localStorage.setItem("json_data", JSON.stringify(json_dict[default_patients[i]]))}}>
              <li className="abouttext">
                <div className='liwrapper'>
                  <p className='leftli'><b>{current_patient}</b></p>
                </div>
              </li>
            </Link>
            <img 
              className='rightli' 
              src={download}
              onClick={() => handleDownload(`https://raw.githubusercontent.com/vikramr2/machina-viz/main/src/samples/${default_patients[i]}/${default_patients[i]}.json`, `${default_patients[i]}.json`)}
            >
            </img>
          </div>
        </div>)
        which_color = !which_color;
    }

    if (document.getElementsByClassName('label').length > 1) {
      const elements = document.getElementsByClassName('label');
      while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
      }
    }

    let handleChange = (e) => {
      const reader = new FileReader();
      const file = e.target.files[0];
      let json_contents;
  
      reader.onload = function(readerEvt) {
        let jsonString = readerEvt.target.result;
        json_contents = jsonString;

        const data = JSON.parse(json_contents);
        let labelnames = data["solutions"].map((value, index) => {return value["name"]});

        // let stateObj = {json_contents: json_contents};
        // history.pushState(stateObj, window.location.href);
        localStorage.setItem("json_data", json_contents);
  
        window.location = window.location + `viz?labeling=${labelnames[0]}`;
        // history.push(`viz?labeling=${labelnames[0]}`);
      }
      // Read the file as a text
      reader.readAsText(file);
    }

    return (
        <div className='home'>
            <div className='panel home'>
                <h1><b>Welcome to MACH2!</b></h1>
                <div className="aboutdir"><Link to="about" style={{ textDecoration: 'none', color: 'black'}}><h4 className='abouttext'>About</h4></Link></div>
                <p><b>A lightweight visualizer for MACH2, <a href="https://www.nature.com/articles/s41588-018-0106-z">MACHINA's</a> sequel.</b> Use this visualizer to examine a solution space for the parsimonious migration history problem and its respective summary for a given patient. Examples are provided below. You can also upload a JSON file to view a custom input. See the about page for more information.</p>
                
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