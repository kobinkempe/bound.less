import {Link, Route, Switch, useRouteMatch, Redirect} from "react-router-dom";
import Canvas from "./Canvas";

export default function CanvasRouter() {
    let {path, url} = useRouteMatch();

    //TODO: Something I don't understand is making it so it doesn't
    // work when you are on a specific canvas and refresh it
    return (
        <div>
            <h2>Canvas</h2>

            <ul>
                <li>
                    <Link to={`${url}/1`}>Canvas #1</Link>
                </li>
                <li>
                    <Link to={`${url}/4`}>
                        Canvas #4
                    </Link>
                </li>
            </ul>

            <Switch>
                <Route path={`${path}/:canvasId`}>
                    <Canvas />
                </Route>
                <Route exact path={path}>
                    <Redirect to='/profile' />
                </Route>
            </Switch>
        </div>
    );
}

