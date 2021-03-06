import {Link, Route, Switch, useRouteMatch, Redirect} from "react-router-dom";
import {CanvasPage} from "./CanvasPage";

export const CanvasRouter = () => {
    let {path, url} = useRouteMatch();
    console.log(path);

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
                <Route path={`${path}`}>
                    <CanvasPage />
                </Route>
                <Route exact path={path}>
                    <Redirect to='/profile/tombrady' />
                </Route>
            </Switch>
        </div>
    );
}

