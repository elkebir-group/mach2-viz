import './App.css';
import About from './components/About.js'
import Viz from './components/Viz.js'
import { compressUrlSafe } from './utils/lzma-url.js'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
  let handleChange = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];
    let json_contents;

    reader.onload = function(readerEvt) {
      let jsonString = readerEvt.target.result;
      json_contents = jsonString;
      console.log(json_contents);

      const data = JSON.parse(json_contents);
      let graphnames = data["migration_graph"].map((value, index) => {return value["name"]});
      let labelnames = data["clone_tree"]["full_labeling"].map((value, index) => {return value["name"]});

      window.location = window.location + `viz?data=${compressUrlSafe(json_contents)}&graph=${graphnames[0]}&labeling=${labelnames[0]}`;
    }
    // Read the file as a text
    reader.readAsText(file);
  }

  return (
    <div className="App">
      <Router>
      <header className="App-header">
      <div className="float-container">
        <div className="float-child">
          <div className="homedir"><b><Link to="" style={{ textDecoration: 'none', color: 'white'}}>MACHINA-Viz</Link></b></div>
        </div>
        <div class="float-child">
          <div className="aboutdir"><Link to="about" style={{ textDecoration: 'none', color: 'white'}}>About</Link></div>
        </div>
      </div>
      </header>
        <Switch>
          <Route path="/about">
            <p className='backarrow'><b><Link to="" style={{ textDecoration: 'none', color: 'black'}}>&#8592; back</Link></b></p>
            <About/>
          </Route>
          <Route path="/viz">
            <p className='backarrow'><b><Link to="" style={{ textDecoration: 'none', color: 'black'}}>&#8592; back</Link></b></p>
            <Viz/>
          </Route>
          <Route exact path="/">
            <input 
              type="file"
              id="json_upload" 
              name="json_upload"
              accept="application/JSON"
              onChange={handleChange}/>
            <label for="json_upload"><div id="addnew" className="dot"><h1 className="plus">+</h1><span class="tooltiptext"><b>Upload Patient JSON</b></span></div></label>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
