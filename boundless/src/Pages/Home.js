import '../Stylesheets/Home.css';
import {useDispatch} from "react-redux";
import HeaderBar from "../Components/headerBar";
import {Link, useHistory} from "react-router-dom";
import {Box, Button} from "@material-ui/core";
import {logIn, logOut} from "../Redux/loginState";
import firebase from '../Firebase'

export default function Home() {
    const history = useHistory();

    var storage = firebase.storage();
    var storageRef = storage.ref();
    var spaceRef = storageRef.child('welcome.jpg');

    storageRef.child('welcome.jpg').getDownloadURL().then(function(url) {
        var test = url;
        alert(url);
        document.querySelector('img').src = test;
    }).catch((error) => {
        switch (error.code) {
            case 'storage/object-not-found':
                console.log("File doesn't exist");
                break;
            case 'storage/unauthorized':
                console.log("User doesn't have permission to access object");
                break;
            case 'storage/canceled':
                console.log("User cancelled upload");
                break;
            case 'storage/unknown':
                console.log("Unknown Error");
                break;
        }
    });

    return (
        <div className="App">
            <HeaderBar/>
            <div class="Welcome-img">
                <img className='Home-img' id="/welcome.jpg" src="" alt="Yeet"/>
            </div>
            <div className='bottomWrapper'>
                <Button variant="contained"
                        color='Primary'
                        className="Button"
                        onClick={()=>{history.push('/canvas/new')}}>
                    Start Creating!
                </Button>
                <div className='sideText'>
                    <p className='text2'> bound.less is a new design tool to help you create your own designs
                    and diagrams on an infinite canvas. Vector based images relieve the constraints of not being able
                        to zoom into your design further, and our dynamic toolset can help you create the diagrams and
                        drawings you want. So far, if you want squares or circles in your diagram, we got you covered.
                        No more running out of paper - your design experience is bound.less. </p>
                </div>
            </div>

        </div>
    );
}
