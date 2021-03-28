import {useHistory, useParams, Link} from "react-router-dom";
import TwoCanvas from "../Draw/TwoCanvas";
import {HexColorPicker} from "react-colorful";
import {useDispatch, useSelector} from "react-redux";
import {changeColorPen, selectRGB} from "../Redux/rSlicePenOptions";
import {Button, Fab, ClickAwayListener} from "@material-ui/core";
import styles from "../Stylesheets/CanvasPage.css";
import "../Stylesheets/CanvasToolBar.css"
import {logIn, logOut, selectLoggedIn} from "../Redux/loginState";
import {useState} from "react";
import {
    AllOut,
    BorderColorRounded,
    Close,
    FormatShapes,
    Palette,
    Work,
    DeleteForever,
    AccountCircle,
    Person,
    Height, Undo,
} from '@material-ui/icons'
import Toolbar from "../Draw/CanvasToolBar";
import LogoSmallIcon from "../Images/toolbarIcons/logoSmall";
import {addCanvas, canAccessCanvas, makeCanvasPrivate, removeCanvas} from "../Firebase";

import WidthSlider from "../Draw/Toolbar/WidthSlider";




import CanvasToolbar from "../Draw/CanvasToolBar";
import {useUndoCount} from "../Draw/TwoHelpers";

// function getRandomColor() {
//     return 'rgb('
//         + Math.floor(Math.random() * 255) + ','
//         + Math.floor(Math.random() * 255) + ','
//         + Math.floor(Math.random() * 255) + ')';
// }

export const CanvasPage = () => {
    let {canvasID} = useParams();
    const history = useHistory();
    const dispatch = useDispatch();

    //Login States
    const loggedIn = useSelector(selectLoggedIn);
    const [loggingIn, setLoggingIn] = useState(false);

    //Tool States
    const [toolSelected, setToolSelected] = useState('pen');
    const [selectColor, setSelectColor] = useState('rgb(0,0,0)');
    const [wipe, setWipe] = useState(false);
    const [lineWidth, setLineWidth] = useState(5);
    const [undoState, setUndoState] = useState(false);

    let onPressButton;
    if(loggedIn){
        onPressButton = ()=>{
            dispatch(logOut());
        }
    } else {
        onPressButton = ()=>{
            setLoggingIn(true);
        }
    }

    let loginBox = () => {
        if(!loggingIn){
            return;
        }
        return (
            <div className='mask2c'>
                <div className='loginBoxC'>
                    <Button onClick={()=>{
                        dispatch(logIn('John Doe'));
                        setLoggingIn(false);
                    }}>
                        Log In as John Doe
                    </Button>
                </div>
            </div>
        )
    }

    let loginButton = () => {
        if(!loggedIn){
            return <Button
                className={'loginButtonItem'}
                variant='contained'
                color='primary'
                onClick={onPressButton}>
                {'Log In/Sign Up'}
            </Button>;
        } else {
            return [
                <Button
                    className={'loginButtonItem'}
                    variant='contained'
                    color='primary'
                    onClick={onPressButton}>
                    {'Log Out'}
                </Button>,
                <Fab className={'profile'}
                     onClick={()=>{
                         history.push('/profile');
                     }}>
                    <Person fontSize={'large'}/>
                </Fab>
            ]
        }
    }

    return (
        <div>
            <div color={"primary"} className={'toolbar'} >
                <CanvasToolbar selectColor={selectColor}
                               setLineWidth={setLineWidth}
                               lineWidth={lineWidth}
                               setToolSelected={setToolSelected}
                               setSelectColor={setSelectColor}
                               setUndoState={setUndoState}
                               setWipe={setWipe}/>
            </div>
            <TwoCanvas
                toolInUse={toolSelected}
                wipe={wipe}
                radius={lineWidth}
                color={selectColor}
                undo={undoState}
            />
            <div className='loginButtonC'>
                {loginButton()}
            </div>
            {loginBox()}
        </div>
    )
}
