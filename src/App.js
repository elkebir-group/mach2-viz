import React, { useState, useEffect } from "react"
import './App.css';

import About from './components/About.js'
import Viz from './components/Viz.js'
import Home from './components/Home.js'
import DualViz from "./components/DualViz";
import SumViz from "./components/SumViz";
import TriViz from "./components/TriViz";

import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { createBrowserHistory } from 'history';


function App() {
  const history = createBrowserHistory({
    basename: '/mach2-viz/#' // Replace with your repository name
  });

  return (
    <div className="App">
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
          <Route path="/mach2-viz/about">
            <About/>
          </Route>
          <Route path="/mach2-viz/viz">
            <Viz/>
          </Route>
          <Route path="/mach2-viz/dualviz">
            <DualViz/>
          </Route>
          <Route path="/mach2-viz/sumviz">
            <SumViz/>
          </Route>
          <Route path="/mach2-viz/triviz">
            <TriViz/>
          </Route>
          <Route path="/mach2-viz">
            <Home/>
          </Route>
          <Route exact path="/">
            <Home/>
          </Route>
        </Switch>
    </div>
  );
}

export default App;
