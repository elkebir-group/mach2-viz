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
            <div className='panel'>
                <h1 className='abouttitle'>Enter MACHINA-Viz</h1>
                <p>MACHINA-Viz is a personalized medical tool to visualize cancer metastasis. Log in or create
    an account to upload patient metadata. Data is formatted as a folder containing:</p>
                <ul>
                    <li><p>A JSON file designating the role of each file</p></li>
                    <li><p>Clonal tree output(s)</p></li>
                    <li><p>(Optional) .tsv showing variant allele frequencies</p></li>
                </ul>
                <p>Click on the processed input entry to view the corresponding visualization. Follow the
    directions noted in the visualization window.</p>
                <p><b>Questions? Contact</b></p>
                <ul>
                    <li><p>Akul Joshi (<a href="mailto:akulj2@illinois.edu">akulj2@illinois.edu</a>)</p></li>
                    <li><p>Vikram Ramavarapu (<a href="mailto:vikramr2@illinois.edu">vikramr2@illinois.edu</a>)</p></li>
                    <li><p>Mohammed El-Kebir (<a href="mailto:melkebir@illinois.edu">melkebir@illinois.edu</a>)</p></li>
                </ul>
            </div>
        </div>
    );
}

export default About;