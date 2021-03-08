import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Home from "./Pages/Home";
import {CanvasRouter} from "./Pages/CanvasRouter";
import './Stylesheets/Home.css';
import {ProfileRouter} from "./Pages/ProfileRouter";
import NotFoundPage from "./Pages/NotFoundPage";

function App() {
  return (
      <Router>
        <div>
          <Switch>
            <Route path="/sheets">
              <CanvasRouter />
            </Route>
            <Route path='/profile'>
              <ProfileRouter />
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </div>
      </Router>
  );
}


export default App;
