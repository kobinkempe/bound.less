import {Route, Switch, useRouteMatch, Redirect} from "react-router-dom";
import Profile from "./Profile";
import ViewAllSheets from "./ViewAllSheets"
import {useSelector} from "react-redux";
import {selectLoggedIn, selectUsername} from "../Redux/loginState";

export const ProfileRouter = () => {
    let {path, url} = useRouteMatch();
    const username = useSelector(selectUsername);
    const loggedIn = useSelector(selectLoggedIn)

    return (
        <div>
            <Switch>
                <Route path={'/profile/:username/view-all'}>
                    <ViewAllSheets/>
                </Route>
                <Route path={`/profile/:username`}>
                    <Profile/>
                </Route>
                <Route exact path={path}>
                    {loggedIn?
                        <Redirect to={'/profile/' + username} />:
                        <Redirect to='/' />
                    }
                </Route>
            </Switch>
        </div>

    );
}

