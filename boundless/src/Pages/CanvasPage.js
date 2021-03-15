import {useHistory, useParams, Link} from "react-router-dom";
import TwoCanvas from "../Draw/TwoCanvas";
import {HexColorPicker} from "react-colorful";
import {useDispatch, useSelector} from "react-redux";
import {changeColorPen, selectRGB} from "../Redux/rSlicePenOptions";
import {Button, Fab, ClickAwayListener} from "@material-ui/core";
import styles from "../Stylesheets/CanvasPage.css";
import "../Stylesheets/CanvasToolBar.css";
import {logIn, logOut, selectLoggedIn} from "../Redux/loginState";
import {useState} from "react";
import {AllOut, BorderColorRounded, Close, FormatShapes, Palette, Work, DeleteForever} from '@material-ui/icons'
import Toolbar from "../Draw/CanvasToolBar";
import LogoSmallIcon from "../Images/toolbarIcons/logoSmall";

function getRandomColor() {
    return 'rgb('
        + Math.floor(Math.random() * 255) + ','
        + Math.floor(Math.random() * 255) + ','
        + Math.floor(Math.random() * 255) + ')';
}
export const CanvasPage = () => {
    let {canvasID} = useParams();
    const history = useHistory();
    const dispatch = useDispatch();
    const loggedIn = useSelector(selectLoggedIn);
    const [loggingIn, setLoggingIn] = useState(false);
    const [toolDisplay, setToolDisplay] = useState('closed');
    const [openPalette, setOpenPalette] = useState(false);
    const selectColor = useSelector(selectRGB);
    const [toolSelected, setToolSelected] = useState('pen');

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

    let logoIcon =
        <Fab className={'tool'}
             onClick={()=>{
                 history.push('/');
             }}>
            <LogoSmallIcon/>
        </Fab>;

    let openToolBar = [
        //Pen
        <Fab className={'tool'}
             onClick={()=>{
                 //TODO: set tools
                 setToolSelected('pen')
             }}>
            <BorderColorRounded/>
        </Fab>,
        //Palette
        <Fab className={'tool'}
             onClick={()=>{
                 if(openPalette){
                     setOpenPalette(false);
                     setToolDisplay('open');
                 } else {
                     setOpenPalette(true);
                     //setToolDisplay('palette');
                 }
             }}>
            <Palette/>
        </Fab>,

        //TextBox
        <Fab className={'tool'}
             onClick={()=>{
                 setToolSelected('rectangle')
             }}>
            <FormatShapes/>
        </Fab>,

        //Weird Circle/Square thing
        <Fab className={'tool'}
             onClick={()=>{
                 setToolSelected('circle')
             }}>
            <AllOut/>
        </Fab>,

        //Wipe Canvas Button
        <Fab className={'tool'}
             onClick={()=>{
                 setToolSelected('wipeCanvas')
             }}>
            <DeleteForever/>
        </Fab>,

        //X
        <Fab className={'tool'} size={'small'}
             onClick={()=>{setToolDisplay('closed')}}>
            <Close/>
        </Fab>
    ];

    let colorPicker =
        <ClickAwayListener onClickAway={()=>{setOpenPalette(false)}}>
            <div className='colorPickerWrapperC'>
                <HexColorPicker className={styles.small}
                                color={selectColor}
                                onChange={(c) => {dispatch(changeColorPen(c))}}
                />
            </div>
        </ClickAwayListener>

    let toolBar = () => {
        switch (toolDisplay) {
            case 'closed':
                return (
                    [
                        logoIcon,
                        <Fab className={'tool'} onClick={()=>{setToolDisplay('open')}}>
                            <Work/>
                        </Fab>
                    ]
                )
            case 'open':
                return [
                    logoIcon,
                    openToolBar,
                    (openPalette? colorPicker: null)
                ];
            default:
                return;
        }
    }

    return (
        <div>
            <div color={"primary"} className={'toolbar'} >
                {toolBar()}
            </div>
            <TwoCanvas toolInUse={toolSelected}/>
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
