import logo from './logo.svg';
import './App.css';
import About from './About.js'

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <div className="float-container">
        <div className="float-child">
          <div className="homedir"><b>MACHINA-Viz</b></div>
        </div>
        <div class="float-child">
          <div className="aboutdir">About</div>
        </div>
      </div>
      </header>
      <About/>
      {/*<div id="addnew" className="dot"><h1 className="plus">+</h1></div>*/}
    </div>
  );
}

export default App;
