import {useHistory, useParams, Link} from "react-router-dom";
import TwoCanvas from "../Draw/TwoCanvas";
import {HexColorPicker} from "react-colorful";
import {useDispatch, useSelector} from "react-redux";
import {changeColorPen, selectRGB} from "../Redux/rSlicePenOptions";
import {Box, Button, ButtonGroup} from "@material-ui/core";
import styles from "../Stylesheets/CanvasPage.css";
import "../Stylesheets/CanvasToolBar.css";
import {logIn, logOut, selectLoggedIn} from "../Redux/loginState";
import {useState} from "react";
import Toolbar from "../Draw/CanvasToolBar";


export const CanvasPage = () => {
    let {canvasID} = useParams();

    const dispatch = useDispatch();
    const loggedIn = useSelector(selectLoggedIn);
    const history = useHistory();
    const [loggingIn, setLoggingIn] = useState(false);
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

    return (
        <div>
            {/*<Box flexDirection={'row'}>*/}
            {/*    <div>*/}
            {/*        <h3>You are viewing canvas #{canvasID}</h3>*/}
            {/*    </div>*/}
            {/*</Box>*/}
            <Toolbar/>
            <TwoCanvas/>
            <a className='logoContainerC' href={'/'}>
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
