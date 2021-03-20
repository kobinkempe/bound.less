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
import {
    AllOut,
    BorderColorRounded,
    Close,
    FormatShapes,
    Palette,
    Work,
    DeleteForever,
    AccountCircle,
    Person
} from '@material-ui/icons'
import Toolbar from "../Draw/CanvasToolBar";
import LogoSmallIcon from "../Images/toolbarIcons/logoSmall";
import {addCanvas, canAccessCanvas, makeCanvasPrivate, removeCanvas} from "../Firebase";

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
    const [wipe, setWipe] = useState(false);
    // const [i, update] = useState(0);

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



    /** I have a feeling that a lot of extra setting are going to be needed to be cleared between tools, so I've
     * started a "cleanup" function that's called whenever tools are switched**/

    let cleanup = () => {
        setWipe(false);

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
                 cleanup();
                 setToolSelected('rectangle')
             }}>
            <FormatShapes/>
        </Fab>,

        //Weird Circle/Square thing
        <Fab className={'tool'}
             onClick={()=>{
                 cleanup();
                 setToolSelected('circle')
             }}>
            <AllOut/>
        </Fab>,

        //Wipe Canvas Button
        <Fab className={'tool'}
             onClick={()=>{
                 // addCanvas(i);
                 // addCanvas(i + 'private', "John Doe", false);
                 // setTimeout(()=>{
                 //     canAccessCanvas(i + 'private', (ret)=>{console.log(ret)});
                 //     canAccessCanvas(i, ret => console.log(ret), 'Fred');
                 // }, 500);
                 // setTimeout(()=>{
                 //     makeCanvasPrivate(i, "John Doe", ()=>console.log("pass1"), ()=>console.log("fail1"))
                 // }, 5000);
                 // setTimeout(()=>{
                 //     removeCanvas(i, "John Doe", ()=>{console.log("pass2")}, ()=>{console.log("fail2")})
                 // }, 10000);
                 // update(i + 1);
                 setWipe(true);
             }}>
            <DeleteForever/>
        </Fab>,

        //X
        <Fab className={'tool'} size={'small'}
             onClick={()=>{
                 cleanup();
                 setToolDisplay('closed')}}>
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
                {toolBar()}
            </div>
            <TwoCanvas toolInUse={toolSelected} wipe={wipe}/>
            <div className='loginButtonC'>
                {loginButton()}
            </div>
            {loginBox()}
        </div>
    )
}
