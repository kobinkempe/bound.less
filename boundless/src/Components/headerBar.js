import '../Stylesheets/headerBar.css';
import {Box, Button, Fab, Link, PropTypes} from "@material-ui/core";
import {logIn, logOut, selectLoggedIn, selectUsername, selectLoggingIn, startLogin, stopLogin} from "../Redux/loginState";
import {useDispatch, useSelector} from "react-redux";
import {HashRouter, useHistory} from "react-router-dom";
import {useState, useEffect} from "react";
import {Person} from "@material-ui/icons";
import GoogleSignIn from "./GoogleSignIn"
import firebase from '../Firebase.js';

export default function HeaderBar({profilePage = false}){
    const dispatch = useDispatch();
    const history = useHistory();
    const [val, setVal] = useState(0); //dummy value updated to force re-render

    if(firebase.auth().currentUser) { //helps with situation where user is already logged into Google account in browser
        dispatch(logIn(firebase.auth().currentUser.displayName));
    }
    let loggedIn = useSelector(selectLoggedIn);
    let loggingIn = useSelector(selectLoggingIn) && !loggedIn;

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

    useEffect(() => {
        if (!loggedIn && sessionStorage.getItem('loggedIn') !== null) {
            dispatch(startLogin());
            dispatch(stopLogin());
        }
    });

    // @ts-ignore
    return(
        <div className='headerBar'>
            <div className={'centering'}>
                <a className='imageContainer' href='/#/'>
                    <div className='logo'/>
                </a>
            </div>
            <Button
                className='loginButton'
                variant='outlined'
                color='primary'
                onClick={onPressButton}>
                {loggedIn?
                    'Log Out':
                    'Log In/Sign Up'}
            </Button>
            {loggedIn && !profilePage?
                <Fab className={'profileH'}
                            onClick={()=>{
                                history.push('/profile');
                            }}>
                    <Person fontSize={'large'}/>
                </Fab>:
                <div/>}
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
