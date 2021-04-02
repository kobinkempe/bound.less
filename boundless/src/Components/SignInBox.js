import {Button} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import GoogleSignIn from "./GoogleSignIn";
import {logIn, logOut, startLogin, stopLogin} from "../Redux/loginState";
import {useDispatch} from "react-redux";
import firebase from "../Firebase";

export function useLoginState(dispatch){
    firebase.auth().onAuthStateChanged(()=>{
        if(firebase.auth().currentUser) { //helps with situation where user is already logged into Google account in browser
            dispatch(logIn(firebase.auth().currentUser.displayName));
        }
    })
}

export function pressButton(dispatch, loggedIn, history=null, profilePage=false){
    if(loggedIn){
        firebase.auth().signOut().then(() => {
            dispatch(logOut());
            sessionStorage.removeItem('loggedIn');
            if(profilePage){
                history.push('');
            }
        }).catch((error) => {
            console.log(error);
        });
    } else {
        dispatch(startLogin());
    }
}

export default function SignInBox(){
    const dispatch = useDispatch();
    let closeButton = () => {
        dispatch(stopLogin());
    };
    return(
        <div className='mask2'>
            <div className='loginBox'>
                <div className='closeRow'>
                    <Button style={{marginRight: '3%'}} onClick={closeButton}>
                        <Close/>
                    </Button>
                </div>
                <GoogleSignIn />
            </div>
        </div>
    )
}