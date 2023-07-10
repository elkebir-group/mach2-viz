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

import DefaultDict from "../utils/DefaultDict.js";

// Import the patient sample datasets
import A7 from "../samples/A7/A7.json";
import A10 from "../samples/A10/A10.json";
import A22 from "../samples/A22/A22.json";
import A29 from "../samples/A29/A29.json";
import A31 from "../samples/A31/A31.json";
import A32 from "../samples/A32/A32.json";
import patient1_LOv from "../samples/patient1_LOv/patient1_LOv.json";
import patient1_ROv from "../samples/patient1_ROv/patient1_ROv.json";
import patient2 from "../samples/patient2/patient2.json";
import patient3_LOv from "../samples/patient3_LOv/patient3_LOv.json";
import patient3_ROv from "../samples/patient3_ROv/patient3_ROv.json";
import patient4_LOv from "../samples/patient4_LOv/patient4_LOv.json";
import patient4_ROv from "../samples/patient4_ROv/patient4_ROv.json";
import patient7_LOv from "../samples/patient7_LOv/patient7_LOv.json";
import patient7_ROv from "../samples/patient7_ROv/patient7_ROv.json";
import patient9_LOv from "../samples/patient9_LOv/patient9_LOv.json";
import patient9_ROv from "../samples/patient9_ROv/patient9_ROv.json";
import patient10 from "../samples/patient10/patient10.json";
import tracerx from "../samples/tracerx/tracerx.json";

/** The home page for the visualizer
 * 
 * @returns JSX/HTML
 */
function Home() {
    /** Download the json dataset when the icon is clicked
     * 
     * @param {*} url (string) The url to download from 
     * @param {*} filename (string) The filename to alias as
     */
    let handleDownload = (url, filename) => {
      axios.get(url, {
        responseType: 'blob',
      })
      .then((res) => {
        fileDownload(res.data, filename)
      })
    }

    // Dictionary mapping dataset name to json object
    var json_dict = {
      "A7": A7,
      "A10": A10,
      "A22": A22,
      "A29": A29,
      "A31": A31,
      "A32": A32,
      "patient1_LOv": patient1_LOv,
      "patient1_ROv": patient1_ROv,
      "patient2": patient2,
      "patient3_LOv": patient3_LOv,
      "patient3_ROv": patient3_ROv,
      "patient4_LOv": patient4_LOv,
      "patient4_ROv": patient4_ROv,
      "patient7_LOv": patient7_LOv,
      "patient7_ROv": patient7_ROv,
      "patient9_LOv": patient9_LOv,
      "patient9_ROv": patient9_ROv,
      "patient10": patient10,
      "tracerx": tracerx,
    }

    // Table values
    var default_patients = ["A7", "A10", "A22", "A29", "A31", "A32", "patient1_LOv", "patient1_ROv", "patient2", "patient3_LOv", "patient3_ROv", "patient4_LOv", "patient4_ROv", "patient7_LOv", "patient7_ROv", "patient9_LOv", "patient9_ROv", "patient10", "tracerx"]
    var default_dirs = ["hoadley_2016", "gundem_2015", "gundem_2015", "gundem_2015", "gundem_2015", "gundem_2015", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "mcpherson_2016", "tracerx"]
    var div_elements = []
    var which_color = true;
    const color1 = "#EBEBEB";
    const color2 = "#A3A3A3";

    // TODO: Perhaps remove this since we're using a different filtration scheme
    sessionStorage.setItem("selected", JSON.stringify(new DefaultDict(0)));
    sessionStorage.setItem("violations", JSON.stringify(new DefaultDict(0)));
    
    // Construct div elements representing the table entries
    for (let i = 0; i < default_patients.length; i++) {
        var current_patient = default_patients[i];
        var current_directory = default_dirs[i];
        var current_color = (which_color ? color1 : color2)

        var link = URLs[current_patient];

        div_elements.push(<div className="patient-container">
          <div className="patientitem" style={{ backgroundColor: current_color }}>
              <p><b>{current_directory}</b></p>
          </div>
          <div className="patientitem" style={{ backgroundColor: current_color }}>
            <Link to={link} style={{ textDecoration: 'none', color: 'black'}} onClick={() => {sessionStorage.setItem("json_data", JSON.stringify(json_dict[default_patients[i]]))}}>
                  <p className='leftli'><b>{current_patient}</b></p>
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

    /** TODO: Maybe change the name of this funciton?
     * But this handles the file upload
     * 
     * @param {*} e (obj) Event metadata
     */
    let handleChange = (e) => {
      // Get the filename from the metadata
      const reader = new FileReader();
      const file = e.target.files[0];
      let json_contents;
  
      reader.onload = function(readerEvt) {
        // Load the json data from the file
        let jsonString = readerEvt.target.result;
        json_contents = jsonString;
        const data = JSON.parse(json_contents);

        // Fetch the first label to default to on viz
        let labelnames = data["solutions"].map((value, index) => {return value["name"]});

        // Store the data in session storage so that the viz route can pull the data
        sessionStorage.setItem("json_data", json_contents);
  
        // Update the window location to the viz route
        window.location = window.location + `viz?labeling=${labelnames[0]}`;
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
                <div className="patient-container">
                  <div className="patientitem" style={{ backgroundColor: "#A3A3A3" }}>
                      <p className='datasettitle'><b>Dataset</b></p>
                  </div>
                  <div className="patientitem" style={{ backgroundColor: "#A3A3A3" }}>
                    <Link to={link} style={{ textDecoration: 'none', color: 'black'}}>
                      <p className='datasettitle'><b>Patient</b></p>
                    </Link>
                  </div>
                </div>

                <div className="panel example">
                      { 
                        div_elements.map(elem => (
                          elem
                        ))
                      }
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