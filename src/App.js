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

import { createBrowserHistory } from 'history';


function App() {
  const history = createBrowserHistory({
    basename: '/machina-viz' // Replace with your repository name
  });

  return (
    <div className="App">
      <Router basename='/machina-viz'>
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
          <Route path="/machina-viz/about">
            <About/>
          </Route>
          <Route path="/machina-viz/viz">
            <Viz/>
          </Route>
          <Route path="/machina-viz/dualviz">
            <DualViz/>
          </Route>
          <Route path="/machina-viz/sumviz">
            <SumViz/>
          </Route>
          <Route path="/machina-viz/triviz">
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
