import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

function About() {
    return (
        <div className='about'>
            <div className='panel about'>
                <div className='aboutcontainer'>
                    <p className='backarrow'><b><Link to="" style={{ textDecoration: 'none', color: 'black'}}>&#8592; home</Link></b></p>
                    <h1 className='abouttitle'>Enter MACHINA-Viz</h1>
                </div>
                <p>MACHINA-Viz is a personalized medical tool to visualize cancer metastasis.</p>
                <p>We have provided a <b>json_compression.py</b> (Python) file with which you can take
                   your data directory and build a JSON file to plug into our visualizer. The format for
                   this directory is as follows:
                   <ul>
                       <li>[dir name].labeling</li>
                       <li>[dir name].tree</li>
                       <li>coloring.txt</li>
                       <li>potential_labelings (containing additional tree labelings)</li>
                   </ul>
                   
                   Running our Python file will generate <b>[dir name].json</b>, which can be plugged into
                   our visualizer to view the clone trees and resultant migration graph. 
                   </p>
                <p><b>Questions? Contact</b></p>
                <ul className="singlecol">
                    <li><p>Akul Joshi (<a href="mailto:akulj2@illinois.edu">akulj2@illinois.edu</a>)</p></li>
                    <li><p>Vikram Ramavarapu (<a href="mailto:vikramr2@illinois.edu">vikramr2@illinois.edu</a>)</p></li>
                    <li><p>Mohammed El-Kebir (<a href="mailto:melkebir@illinois.edu">melkebir@illinois.edu</a>)</p></li>
                </ul>
            </div>
        </div>
    );
}

export default About;