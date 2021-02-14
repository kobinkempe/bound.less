import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Home from "./Pages/Home";
import CanvasRouter from "./Pages/CanvasRouter";
import Profile from "./Pages/Profile";

function App() {
  return (
      <Router>
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/canvas">Start Creating!</Link>
            </li>
          </ul>

          <Switch>
            <Route path="/canvas">
              <CanvasRouter />
            </Route>
            <Route path='/profile'>
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
