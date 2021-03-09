import '../Stylesheets/headerBar.css';
import {Box, Button, Link} from "@material-ui/core";
import {logIn, logOut, selectLoggedIn} from "../Redux/loginState";
import {useDispatch, useSelector} from "react-redux";
import {HashRouter, useHistory} from "react-router-dom";
import {useState} from "react";

export default function HeaderBar(){
    const dispatch = useDispatch();
    const loggedIn = useSelector(selectLoggedIn);
    const history = useHistory();
    const [loggingIn, setLoggingIn] = useState(false);
    const navigate = () => {
        history.push('/profile')
    }
    let onPressButton;
    if(loggedIn){
        onPressButton = ()=>{
            dispatch(logOut());
            navigate();
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
            <div className='mask2'>
                <div className='loginBox'>
                    <Button onClick={()=>{
                        dispatch(logIn('John Doe'));
                        navigate();
                    }}>
                        Log In as John Doe
                    </Button>
                </div>
            </div>
        )
    }

    return(
        <div className='headerBar'>
            <a className='imageContainer' href={'/#/'}>
                <div className='logo'/>
            </a>
            <Button
                className='loginButton'
                variant='outlined'
                color='primary'
                onClick={onPressButton}>
                {loggedIn?
                    'Log Out':
                    'Log In/Sign Up'}
            </Button>
            {loginBox()}
        </div>
    )
}