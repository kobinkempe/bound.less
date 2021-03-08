import {Link, Route, Switch, useRouteMatch, Redirect} from "react-router-dom";
import {CanvasPage} from "./CanvasPage";
import {BottomNavigation, Box} from "@material-ui/core";
import {HexColorPicker} from "react-colorful";
import {changeColorPen, selectRGB} from "../Redux/rSlicePenOptions";
import {useDispatch, useSelector} from "react-redux";

export const CanvasRouter = () => {
    let {path, url} = useRouteMatch();
    const selectColor = useSelector(selectRGB);
    const colorDispatch = useDispatch();
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
                    <CanvasPage
                        canvasID={path[path.length-1]}
                    />
                </Route>
                <Route exact path={path}>
                    <Redirect to='/profile/tombrady' />
                </Route>
            </Switch>
        </div>

    );
}

