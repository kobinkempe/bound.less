import {Route, Switch, useRouteMatch, Redirect} from "react-router-dom";
import {CanvasPage} from "./CanvasPage";

export const CanvasRouter = () => {
    let {path, url} = useRouteMatch();

    return (
        <div>

            <Switch>
                <Route path={`/sheets/:canvasID`}>
                    <CanvasPage/>
                </Route>
                <Route exact path={path}>
                    <Redirect to='/profile' />
                </Route>
            </Switch>
        </div>

    );
}

