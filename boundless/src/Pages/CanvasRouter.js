import {Route, Switch, useRouteMatch, Redirect, useLocation} from "react-router-dom";
import {CanvasPage} from "./CanvasPage";
import {useSelector} from "react-redux";
import {selectLoggedIn, selectUsername} from "../Redux/loginState";
import RequestAccess from "./RequestAccess";
import firebase, {addCanvas} from "../Firebase";

export const CanvasRouter = ({isNew}) => {
    let {path, url} = useRouteMatch();
    let pathname = useLocation().pathname;
    let id = pathname.substring(8); //cut out "/canvas/"
    const loggedIn = useSelector(selectLoggedIn);
    const username = useSelector(selectUsername);
    const hasPermission = !(loggedIn && username === 'janeDoe')

    if (isNew) {
        id = Date.now().toString(); //using current time (in ms) provides unique id in virtually all situations
        addCanvas(id, username, true, () => {}, () => {
            console.log("Did not add to DB");
            });
    }

    return (
        isNew ? <Redirect to={`/canvas/${id}`} /> :
        <div>

            <Switch>
                <Route path={`/canvas/:canvasID`}>
                    {hasPermission?
                        <CanvasPage isNew={isNew}/>:
                        <RequestAccess/>}
                </Route>
                <Route exact path={path}>
                    <Redirect to='/profile' />
                </Route>
            </Switch>
        </div>

    );
}

