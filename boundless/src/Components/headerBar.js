import '../Stylesheets/headerBar.css';
import {Button, Fab} from "@material-ui/core";
import {selectLoggedIn, selectLoggingIn} from "../Redux/loginState";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {Person} from "@material-ui/icons";
import SignInBox, {pressButton, useLoginState} from "./SignInBox";

export default function HeaderBar({profilePage = false}){
    const dispatch = useDispatch();
    const history = useHistory();

    useLoginState(dispatch);

    let loggedIn = useSelector(selectLoggedIn);
    let loggingIn = useSelector(selectLoggingIn) && !loggedIn;

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
                onClick={()=>{pressButton(dispatch, loggedIn, history, profilePage)}}>
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
                </Fab>
                :null
            }
            {loggingIn ? <SignInBox/>:null}
        </div>
    )
}
