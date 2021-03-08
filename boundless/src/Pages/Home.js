import '../Stylesheets/Home.css';
import {useDispatch} from "react-redux";
import {Link} from "react-router-dom";
import {Button} from "@material-ui/core";
import {logIn, logOut} from "../Redux/loginState";
import GoogleSignIn from "../Components/GoogleSignIn"

export default function Home() {
    const dispatch = useDispatch();

    return (
        <div className="App">
            <div style={{lineHeight: 1.5}}>
                <Link to="/" className="Header-text">Home</Link>
                <Link to="/sheets/1" className="Header-text">Start Creating!</Link>
                <GoogleSignIn/>
            </div>
            <header className="App-header">
                <div className="Welcome-message">
                    <h2 className="">Welcome to bound.less!</h2>
                    <h2>Start creating today!</h2>
                </div>

                <img src="https://digitalworkplace.global.fujitsu.com/wp-content/uploads/2018/07/image-for-spain-infographic-1200x968.jpg" className="Welcome-image"/>
            </header>
        </div>
    );
}
