import '../Stylesheets/headerBar.css';
import {Box, Button, Link} from "@material-ui/core";
import {logIn, logOut} from "../Redux/loginState";
import {useDispatch} from "react-redux";
import {HashRouter} from "react-router-dom";

export default function HeaderBar(){
    const dispatch = useDispatch();
    return(
        <div className='headerBar'>
            <a className='imageContainer' href={'/'}>
                <div className='logo'/>
            </a>
            <Button className='loginButton'>Log in/Sign Up</Button>
        </div>
    )
}