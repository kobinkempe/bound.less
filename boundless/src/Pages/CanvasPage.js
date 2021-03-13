import {useHistory, useParams, Link} from "react-router-dom";
import TwoCanvas from "../Draw/TwoCanvas";
import {HexColorPicker} from "react-colorful";
import {useDispatch, useSelector} from "react-redux";
import {changeColorPen, selectRGB} from "../Redux/rSlicePenOptions";
import {Button, Fab} from "@material-ui/core";
import styles from "../Stylesheets/CanvasPage.css";
import "../Stylesheets/CanvasToolBar.css";
import {logIn, logOut, selectLoggedIn} from "../Redux/loginState";
import {useState} from "react";
import {AllOut, BorderColor, BorderColorRounded, Close, FormatShapes, Palette, Work} from '@material-ui/icons'
import Toolbar from "../Draw/CanvasToolBar";

export const CanvasPage = () => {
    let {canvasID} = useParams();

    const dispatch = useDispatch();
    const loggedIn = useSelector(selectLoggedIn);
    const [loggingIn, setLoggingIn] = useState(false);
    const [toolDisplay, setToolDisplay] = useState('closed');
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

    let openToolBar = [
        <Fab className={'tool'}
             onClick={()=>{
                 //TODO: set tools
                 setToolDisplay('closed')
             }}>
            <BorderColorRounded/>
        </Fab>,
        <Fab className={'tool'}
             onClick={()=>{
                 if(toolDisplay === 'palette'){
                     setToolDisplay('open');
                 } else {
                     setToolDisplay('palette');
                 }
             }}>
            <Palette/>
        </Fab>,
        <Fab className={'tool'}
             onClick={()=>{
                 //TODO: set tools
                 setToolDisplay('closed')
             }}>
            <FormatShapes/>
        </Fab>,
        <Fab className={'tool'}
             onClick={()=>{
                 //TODO: set tools
                 setToolDisplay('closed')
             }}>
            <AllOut/>
        </Fab>,
        <Fab className={'tool'}
             onClick={()=>{setToolDisplay('closed')}}>
            <Close/>
        </Fab>
    ];

    let colorPicker =
        <div className='colorPickerWrapperC'>
            <HexColorPicker className={styles.small}
                            color={selectColor}
                            onChange={(c) => {dispatch(changeColorPen(c))}}
            />
        </div>

    let toolBar = () => {
        switch (toolDisplay) {
            case 'closed':
                return (
                    <Fab className={'tool'} onClick={()=>{setToolDisplay('open')}}>
                        <Work/>
                    </Fab>
                )
            case 'open':
                return openToolBar;
            case 'palette':
                return [openToolBar, colorPicker];
            default:
                return;
        }
    }

    return (
        <div>
            <div color={"primary"} className={'toolbar'} >
                {toolBar()}
            </div>
            <Toolbar/>
            <TwoCanvas/>
            <a className='logoContainerC' href={'/#/'}>
                <div className='logoC'/>
            </a>
            <div className='loginButtonC'>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={onPressButton}>
                    {loggedIn?
                        'Log Out':
                        'Log In/Sign Up'}
                </Button>
            </div>
            {loginBox()}
        </div>
    )
}
