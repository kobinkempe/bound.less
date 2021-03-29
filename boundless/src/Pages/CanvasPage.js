import {useHistory, useParams, Link} from "react-router-dom";
import TwoCanvas from "../Draw/TwoCanvas";
import {HexColorPicker} from "react-colorful";
import {useDispatch, useSelector} from "react-redux";
import {changeColorPen, selectRGB} from "../Redux/rSlicePenOptions";
import {Button, Fab, ClickAwayListener} from "@material-ui/core";
import styles from "../Stylesheets/CanvasPage.css";
import "../Stylesheets/CanvasToolBar.css"
import {logIn, logOut, selectLoggedIn, selectLoggingIn, startLogin, stopLogin} from "../Redux/loginState";
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
import firebase from '../Firebase.js';
import WidthSlider from "../Draw/Toolbar/WidthSlider";
import GoogleSignIn from "../Components/GoogleSignIn";



import CanvasToolbar from "../Draw/CanvasToolBar";
import {useNumUndos, useUndoCount} from "../Draw/TwoHelpers";

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

    //Login States and Variables
    let loggedIn = useSelector(selectLoggedIn);
    const [val, setVal] = useState(0);
    if(firebase.auth().currentUser) { //helps with situation where user is already logged into Google account in browser
        dispatch(logIn(firebase.auth().currentUser.displayName));
    }
    let loggingIn = useSelector(selectLoggingIn) && !loggedIn;

    //Tool States
    const [toolSelected, setToolSelected] = useState('pen');
    const [selectColor, setSelectColor] = useState('rgb(0,0,0)');
    const [wipe, setWipe] = useState(false);
    const [lineWidth, setLineWidth] = useState(5);
    const [undoState, setUndoState] = useState(false);
    const [undos, incUndos] = useNumUndos(0);

    let onPressButton;
    if(loggedIn){
        onPressButton = ()=>{
            firebase.auth().signOut().then(() => {
                dispatch(logOut());
                loggedIn = false;
                sessionStorage.removeItem('loggedIn');
                setVal(val + 1);
            }).catch((error) => {
                console.log(error);
            });
        }
    } else {
        onPressButton = ()=>{
            dispatch(startLogin());
        }
    }

    let closeButton = () => {
        dispatch(stopLogin());
        setVal(val + 1);
    };

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
                               setUndoState={incUndos}
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
            {loggingIn ?
                <div className='mask2'>
                    <div className='loginBox'>
                        <GoogleSignIn />
                        <Button onClick={closeButton}>
                            Close Window
                        </Button>
                    </div>
                </div> :
                <div/>}
        </div>
    )
}
