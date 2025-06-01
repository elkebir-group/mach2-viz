import React, { useState, useEffect } from 'react';
import {
    Link
  } from "react-router-dom";

import URLs from "../utils/default_url.json";
import download from "../assets/download.png";

import axios from 'axios'
import fileDownload from 'js-file-download'

import DefaultDict from "../utils/DefaultDict.js";

import { compressUrlSafe } from '../utils/lzma-url.js';

// Import the patient sample datasets
import mapping from '../samples/mapping.json';

/** The home page for the visualizer
 * 
 * @returns JSX/HTML
 */
function Home() {
    const [modulesLoaded, setModulesLoaded] = useState(false);
    const [jsonDict, setJsonDict] = useState({});
    const [defaultPatients, setDefaultPatients] = useState([]);
    const [defaultDirs, setDefaultDirs] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragCounter, setDragCounter] = useState(0); // eslint-disable-line no-unused-vars

    const importComponent = async (file) => {
      try {
        const module = await import(`../samples/${file}`);
        return module;
      } catch (error) {
        console.error("An error occurred while importing:", error);
        throw error;
      }
    };

    const findDataset = (name) => {
      const item = mapping.find(obj => obj.name === name);
      return item ? item.dataset : null;
  };

    useEffect(() => {
      const loadComponents = async () => {
        const promises = mapping.map(async (item) => {
          const module = await importComponent(item['path']);
          return { name: item['name'], module: module.default }; // Assuming a default export
        });
  
        const results = await Promise.all(promises);
        const newJsonDict = {};
        const newDefaultPatients = [];
        const newDefaultDirs = [];
  
        results.forEach(({ name, module }) => {
          newJsonDict[name] = module;
          newDefaultPatients.push(name);
          newDefaultDirs.push(findDataset(name));
        });
  
        setJsonDict(newJsonDict);
        setDefaultPatients(newDefaultPatients);
        setDefaultDirs(newDefaultDirs);
        setModulesLoaded(true);
      };
  
      loadComponents().catch((error) => {
        console.error("Error loading components:", error);
      });
    }, []);

    if (!modulesLoaded) {
      return <div className='panel'><h1>Loading...</h1></div>; // or any other loading indicator
    }

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

    var div_elements = []
    var which_color = true;
    const color1 = "#EBEBEB";
    const color2 = "#A3A3A3";

    // TODO: Perhaps remove this since we're using a different filtration scheme
    sessionStorage.setItem("selected", JSON.stringify(new DefaultDict(0)));
    sessionStorage.setItem("violations", JSON.stringify(new DefaultDict(0)));
    
    // Construct div elements representing the table entries
    for (let i = 0; i < defaultPatients.length; i++) {
        var current_patient = defaultPatients[i];
        var current_directory = defaultDirs[i];
        var current_color = (which_color ? color1 : color2)

        console.log(current_patient);

        var link = URLs[current_patient];

        console.log(link);

        div_elements.push(
          // eslint-disable-next-line no-loop-func
          <Link className="patient-link" onClick={() => {
            // Create overlay div
            const overlay = document.createElement('div');
            overlay.id = 'overlay';

            // Create loading container div
            const loadingContainer = document.createElement('div');
            loadingContainer.id = 'loading-container';

            // Create h1 element
            const loadingHeader = document.createElement('h1');
            loadingHeader.textContent = 'Loading...';

            // Append elements
            loadingContainer.appendChild(loadingHeader);
            overlay.appendChild(loadingContainer);
            document.body.appendChild(overlay);

            // Add a small delay (e.g., 100ms) before the sessionStorage operation
            setTimeout(() => {
              sessionStorage.setItem("json_data", compressUrlSafe(JSON.stringify(jsonDict[defaultPatients[i]])));
              window.location.href = `#/${link}`
            }, 100);
          }}>
            <div className="patient-container">
              <div className="patientitem" style={{ backgroundColor: current_color }}>
                  <p><b>{current_directory}</b></p>
              </div>
              <div className="patientitem2" style={{ backgroundColor: current_color}}>
                  <p className='leftli'><b>{current_patient}</b></p>
                <img 
                  className='rightli' 
                  src={download}
                  alt="download"
                  onClick={() => handleDownload(`https://raw.githubusercontent.com/vikramr2/machina-viz/main/src/samples/${defaultPatients[i]}/${defaultPatients[i]}.json`, `${defaultPatients[i]}.json`)}
                >
                </img>
              </div>
            </div>
          </Link>

        )
        which_color = !which_color;
    }

    /** TODO: Maybe change the name of this funciton?
     * But this handles the file upload
     * 
     * @param {*} e (obj) Event metadata
     */
    let handleChange = (e) => {
      // Create overlay div
      const overlay = document.createElement('div');
      overlay.id = 'overlay';

      // Create loading container div
      const loadingContainer = document.createElement('div');
      loadingContainer.id = 'loading-container';

      // Create h1 element
      const loadingHeader = document.createElement('h1');
      loadingHeader.textContent = 'Loading...';

      // Append elements
      loadingContainer.appendChild(loadingHeader);
      overlay.appendChild(loadingContainer);
      document.body.appendChild(overlay);

      setTimeout(() => {
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
          sessionStorage.setItem("json_data", compressUrlSafe(json_contents));
    
          // Update the window location to the viz route
          window.location = window.location + `viz?labeling=${labelnames[0]}`;
        }
        // Read the file as a text
        reader.readAsText(file);
      }, 100)
      
    }

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev + 1);
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => {
            const newCounter = prev - 1;
            if (newCounter === 0) {
                setIsDragOver(false);
            }
            return newCounter;
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        setDragCounter(0);
        
        console.log('Drop event triggered');
        
        const files = e.dataTransfer.files;
        console.log('Files dropped:', files);
        
        if (files && files.length > 0) {
            const file = files[0];
            console.log('File type:', file.type, 'File name:', file.name);
            
            if (file.type === "application/json" || file.name.toLowerCase().endsWith('.json')) {
                const syntheticEvent = {
                    target: {
                        files: files
                    }
                };
                console.log('Calling handleChange');
                handleChange(syntheticEvent);
            } else {
                alert("Please drop a JSON file.");
            }
        }
    };

    return (
        <div className='home'>
            <div className='panel home-panel'>
              <div className='left-column-container'>
                <div className='home-column-1'>
                  <h1><b>Welcome to MACH2!</b></h1>
                  {/* <div className="aboutdir"><Link to="about" style={{ textDecoration: 'none', color: 'black'}}><h4 className='abouttext'>About</h4></Link></div> */}
                  <div className="about-text">
                    <p><b>A lightweight visualizer for MACH2, <a href="https://www.nature.com/articles/s41588-018-0106-z">MACHINA's</a> sequel.</b> Use this visualizer to examine a solution space for the parsimonious migration history problem and its respective summary for a given patient. Examples are provided below. You can also upload a JSON file to view a custom input. See the Instructions page for how to use this website:</p> 
                  </div>
                  
                  <Link to="about" style={{ textDecoration: 'none', color: 'black'}}>
                    <button className="about-button">Instructions</button>
                  </Link>
                </div>
                <div className={`home-column-1-1 ${isDragOver ? 'drag-over' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}>
                    {isDragOver && (
                        <div className="drag-overlay">
                            <div className="drag-overlay-text"><p>Drop file here</p></div>
                        </div>
                    )}
                    <h3>Upload a JSON file</h3>
                    <p className='center-text'>To upload your own MACH2-generated JSON file, click the (+) button, or drag and drop a JSON file here</p>
                    <div className="upload-container">
                        <div>
                            <input 
                                type="file"
                                id="json_upload" 
                                name="json_upload"
                                accept="application/JSON"
                                onChange={handleChange}/>
                            <label htmlFor="json_upload" className="upload-label">
                                <div id="addnew" className="dot">
                                    <h1 className="plus">+</h1>
                                    <span className="tooltiptext"><b>Upload Patient JSON</b></span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
              </div>
                {/* <div className="line"></div> */}

                <div className="home-column-2">
                  <div className='patient-list-title-container'>
                    <h3>Examples</h3>
                    <div className="patient-container">
                        <div className="patientitem" style={{ backgroundColor: "#717171" }}>
                            <p className='datasettitle' style={{color: "black"}}><b>Dataset</b></p>
                        </div>
                        <div className="patientitem" style={{ backgroundColor: "#717171" }}>
                          <Link to={link} style={{ textDecoration: 'none', color: 'black'}}>
                            <p className='datasettitle' style={{color: "black"}}><b>Patient</b></p>
                          </Link>
                        </div>
                      </div>
                  </div>
                  <div className="patient-list-container">

                    {/* { 
                      div_elements.map(elem => (
                        elem
                      ))
                    } */}

                    { 
                      div_elements.map((elem, index) => (
                        <React.Fragment key={index}>
                          {elem}
                        </React.Fragment>
                      ))
                    }
                  </div>
                </div>

            </div>
        </div>
    );
}

export default Home;
