import {Route, Switch, useRouteMatch, Redirect} from "react-router-dom";
import {CanvasPage} from "./CanvasPage";
import {useSelector} from "react-redux";
import {selectLoggedIn, selectUsername} from "../Redux/loginState";
import RequestAccess from "./RequestAccess";

export const CanvasRouter = () => {
    let {path, url} = useRouteMatch();
    const loggedIn = useSelector(selectLoggedIn);
    const username = useSelector(selectUsername);
    const hasPermission = !(loggedIn && username === 'janeDoe')
    return (
        <div>

            <Switch>
                <Route path={`/canvas/:canvasID`}>
                    {hasPermission?
                        <CanvasPage/>:
                        <RequestAccess/>}
                </Route>
                <Route exact path={path}>
                    <Redirect to='/profile' />
                </Route>
            </Switch>
        </div>

    );
}

