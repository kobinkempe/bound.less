import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Home from "./Pages/Home";
import {CanvasRouter} from "./Pages/CanvasRouter";
import Profile from "./Pages/Profile";
import './Stylesheets/Home.css';

function App() {
  return (
      <Router>
        <div>
          <div style={{lineHeight: 1.5}}>
            <Link to="/" className="Header-text">Home</Link>
            <Link to="/canvas/1" className="Header-text">Start Creating!</Link>
          </div>

          <Switch>
            <Route path="/canvas/:canvasID">
              <CanvasRouter />
            </Route>
            <Route path='/profile/:username'>
              <Profile />
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
  );
}


export default App;
