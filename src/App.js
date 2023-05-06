import React, { useState, useEffect } from "react"
import './App.css';

import About from './components/About.js'
import Viz from './components/Viz.js'
import Home from './components/Home.js'
import DualViz from "./components/DualViz";
import SumViz from "./components/SumViz";
import TriViz from "./components/TriViz";

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
        <Switch>
          <Route path="/about">
            <About/>
          </Route>
          <Route path="/viz">
            <Viz/>
          </Route>
          <Route path="/dualviz">
            <DualViz/>
          </Route>
          <Route path="/sumviz">
            <SumViz/>
          </Route>
          <Route path="/triviz">
            <TriViz/>
          </Route>
          <Route path="/machina-viz">
            <Home/>
          </Route>
          <Route exact path="/">
            <Home/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
