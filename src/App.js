import logo from './logo.svg';
import './App.css';
import About from './About.js'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
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
          <Route exact path="/">
            <input 
              type="file"
              id="json_upload" 
              name="json_upload"
              accept="image/*"/>
            <label for="json_upload"><div id="addnew" className="dot"><h1 className="plus">+</h1></div></label>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
