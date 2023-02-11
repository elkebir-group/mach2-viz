import logo from './logo.svg';
import './App.css';
import About from './About.js'
import Viz from './Viz.js'
import { compressUrlSafe } from './lzma-url.js'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

// LZW-compress a string
function lzw_encode(s) {
  var dict = {};
  var data = (s + "").split("");
  var out = [];
  var currChar;
  var phrase = data[0];
  var code = 256;
  for (var i=1; i<data.length; i++) {
      currChar=data[i];
      if (dict[phrase + currChar] != null) {
          phrase += currChar;
      }
      else {
          out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
          dict[phrase + currChar] = code;
          code++;
          phrase=currChar;
      }
  }
  out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
  for (var i=0; i<out.length; i++) {
      out[i] = String.fromCharCode(out[i]);
  }
  return out.join("");
}

function App() {
  let handleChange = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];
    let json_contents;

    reader.onload = function(readerEvt) {
      let jsonString = readerEvt.target.result;
      json_contents = jsonString;
      console.log(json_contents);
      window.location = window.location + `viz?data=${compressUrlSafe(json_contents)}`
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
            <p>Successful Upload :)</p>
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
