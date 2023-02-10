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
            <div id="addnew" className="dot"><h1 className="plus">+</h1></div>
          </Route>
        </Switch>
      </Router>
      {/*<div id="addnew" className="dot"><h1 className="plus">+</h1></div>*/}
    </div>
  );
}

export default App;
