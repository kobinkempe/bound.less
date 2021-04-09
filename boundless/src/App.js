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
import TermsOfService from "./Pages/TermsOfService";
import PrivacyPolicy from "./Pages/PrivacyPolicy";

function App() {
  return (
      <Router>
        <div>
          <Switch>
            <Route path="/canvas/new">
              <CanvasRouter isNew={true}/>
            </Route>
            <Route path="/canvas/:canvasId">
              <CanvasRouter isNew={false}/>
            </Route>
            <Route path='/profile'>
              <ProfileRouter />
            </Route>
            <Route path='/terms-of-service'>
              <TermsOfService/>
            </Route>
            <Route path='/privacy-policy'>
              <PrivacyPolicy />
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
