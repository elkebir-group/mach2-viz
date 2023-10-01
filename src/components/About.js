import React from 'react';
import {
    Link
  } from "react-router-dom";

// Figures
import sample_page from "../assets/sample_page.png";


/**
 * This page is simply a description of the application with a contact list
 */
function About() {
    return (
        <div className='about'>
            <div className='panel about'>
                <div className='aboutcontainer'>
                    <p className='backarrow'><b><Link to="" style={{ textDecoration: 'none', color: 'black'}}>&#8592; home</Link></b></p>
                    <h1 className='abouttitle'>Instructions</h1>
                </div>
                <p><b>NOTE: If you want to see more detailed documentation, refer to the following <a href='https://github.com/elkebir-group/mach2-viz/blob/main/docs/documentation.md'>link</a></b></p>
                <p id='mach2'><b>MACH2</b> is a personalized tool to visualize cancer metastasis. It is a sequel to MACHINA, an algorithm designed to solve the Parsimonious Migration History Problem (PMH problem).</p>
                <p id='ii'><b>The Parsimonious Migration History Problem:</b> Given current oncological mutations at their respective anatomical sites, how can we infer their mutation tree as well as a network of anatomical sites inferring metastases?</p>
                <p id='iii'><b>Visualization Format:</b></p>
                <p>Upon selecting one of the examples on the home page, you will be redirected to the visualization page. The page showcases multiple panels. The descriptions along with an image of the panels are shown below:</p>
                <ul style={{columns: 1}}>
                    <li><p><b>MACH2 Solutions (middle and right):</b>The solutions computed by MACH2 are displayed here. Change between possible solutions by selecting the drop down menu at the top of the panel. Each graph in this panel is described below:</p></li>
                    <ul style={{columns: 1}}>
                        <li><p><b>Clonal Tree (bottom right and bottom middle):</b> This is a tree of oncological mutations. Each node in this tree is a variant allele in the cancer patient. Each edge is a mutation from one variant to another.
                        In the case of multiple clonal tree solutions, you can click the drop-down on the main panel (labeled "jsons/hoadley16_A7-1" below) to select between them.
                        Additionally, you can see that there are buttons that say "Clonal Tree" and "Input Tree". The clonal tree displays the tree of mutations after polytomy refinement done by MACH2. The input tree is simply the original tree before these refinements are applied.
                        </p></li>
                        <li><p><b>Migration Graph (top right and top middle):</b> Each node in the clonal tree has a tag with an anatomical location inferred using <a href='https://en.wikipedia.org/wiki/Maximum_parsimony_(phylogenetics)'>Maximum Parsimony</a>. The clonal tree is compressed into a migration graph where each node represents an anatomical location, and each edge is a metastasis (e.g. a migration) between two anatomical locations.</p></li>   
                    </ul>
                    <li><p><b>Summary (left):</b> You can also view a summary migration graph that is computed by unioning edges across migration graphs in each solution. Edges are weighted by the number of solutions they appear in.</p></li>
                </ul>
                <p>You can click on the long gray bars on the sides of the visualization page to add extra panels. You can also click the "[X]" buttons on the top right corners of panels to delete them.</p>
                <div className="image-container">
                    <img className='aboutimg' src={sample_page} alt="Sample Page"></img>
                </div>
                <p id='iv'><b>Filtering Solutions:</b></p>
                <p>The user has an option to delete or require edges displayed on the Summary Panel. Their functions are described below:</p>
                <ul style={{columns: 1}}>
                    <li><p><b>Delete edges: </b>Shift+Click on an edge in the summary panel to delete it. By deleting it, the MACH2 solution panels will only show solutions that do not have the edge in their solution.</p></li>
                    <li><p><b>Require edges: </b>Click on an edge in the summary panel to require it. By requiring it, the MACH2 solution panels will only show solutions that have that edge in their solution.</p></li>
                </ul>
                <p>To undo actions, you can click the undo arrow that will appear on the top right corner of the summary panel after editing the summary panel edges.</p>
                <p id='v'><b>Generating inputs:</b></p>
                <p>MACH2 should already output a JSON format that is fully compatible with MACH2-Viz. However, if you are interested in using MACHINA, we have provided a <a href="https://github.com/vikramr2/json_compression">json compression</a> program that takes an output directory from MACHINA that contains <b>.tree</b> files and their corresponding <b>.labeling</b> files, and returns a <b>.json</b> file that can be used as input for this visualizer. Click the "+" icon in the home page to use this feature. For more information, see this <a href='https://github.com/vikramr2/json_compression/blob/main/README.md'>README</a>. Output from any algorithm that solves the PMH problem will be accepted provided that it is in a JSON format as shown in the README.</p>
                <p id='vi'><b>Questions? Contact</b></p>
                <ul id="singlecol">
                    <li><p>Vikram Ramavarapu (<a href="mailto:vikramr2@illinois.edu">vikramr2@illinois.edu</a>)</p></li>
                    <li><p>Roman Mineyev (<a href="mailto:mineyev2@illinois.edu">mineyev2@illinois.edu</a>)</p></li>
                    <li><p>Akul Joshi (<a href="mailto:akulj2@illinois.edu">akulj2@illinois.edu</a>)</p></li>
                    <li><p>Mrinmoy Roddur (<a href="mailto:mroddur2@illinois.edu">mroddur2@illinois.edu</a>)</p></li>
                    <li><p>Mohammed El-Kebir (<a href="mailto:melkebir@illinois.edu">melkebir@illinois.edu</a>)</p></li>
                </ul>
            </div>
        </div>
    );
}

export default About;