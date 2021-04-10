import {useHistory, useParams} from "react-router-dom";
import TwoCanvas from "../Draw/TwoCanvas";
import {useDispatch, useSelector} from "react-redux";
import {Button, Fab} from "@material-ui/core";
import "../Stylesheets/CanvasPage.css"
import {selectLoggedIn, selectLoggingIn} from "../Redux/loginState";
import {useState} from "react";
import {Person} from '@material-ui/icons'
import CanvasToolbar from "../Draw/CanvasToolBar";
import {useNumUndos} from "../Draw/TwoHelpers";
import SignInBox, {pressButton, useLoginState} from "../Components/SignInBox";

// This is an array of constants for the pen type --------------------
// 0:'freehand', 1:'dotted', 2:"straight"
// TODO: change to highlight, freehand, straight
export const PEN_TYPES = ['freehand', 'dotted', "straight"]


export const CanvasPage = () => {
    const {canvasID} = useParams();
    const history = useHistory();
    const dispatch = useDispatch();

    //Login States and Variables
    let loggedIn = useSelector(selectLoggedIn);
    let loggingIn = useSelector(selectLoggingIn) && !loggedIn;
    useLoginState(dispatch);

    //Tool States
    const [toolSelected, setToolSelected] = useState('pen');
    const [selectColor, setSelectColor] = useState('rgb(0,0,0)');
    const [wipe, setWipe] = useState(false);
    const [lineWidth, setLineWidth] = useState(5);
    const [undoState, setUndoState] = useState(false);
    const [redo, setRedo] = useState(false);
    //const [undos, incUndos] = useNumUndos(0);
    const [penType, setPenType] = useState(PEN_TYPES[0])

    let loginButton = () => {
        if(!loggedIn){
            return <Button
                className={'loginButtonItem'}
                variant='contained'
                color='primary'
                onClick={()=>pressButton(dispatch, loggedIn)}>
                {'Log In/Sign Up'}
            </Button>;
        } else {
            return [
                <Button
                    className={'loginButtonItem'}
                    variant='contained'
                    color='primary'
                    onClick={()=>pressButton(dispatch, loggedIn)}>
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
                               setUndo={setUndoState}
                               setRedo={setRedo}
                               setWipe={setWipe}
                               penType={penType}
                               setPenType={setPenType}/>
            </div>
            <TwoCanvas
                toolInUse={toolSelected}
                wipe={wipe}
                radius={lineWidth}
                color={selectColor}
                undo={undoState}
                penType={penType}
                setWipe={setWipe}
                setUndo={setUndoState}
                redo={redo}
                setRedo={setRedo}
            />
            <div className='loginButtonC'>
                {loginButton()}
            </div>
            {loggingIn ? <SignInBox/>:null}
        </div>
    )
}
