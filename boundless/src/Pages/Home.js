import '../Stylesheets/Home.css';
import {useDispatch} from "react-redux";
import HeaderBar from "../Components/headerBar";
import {Link, useHistory} from "react-router-dom";
import {Box, Button} from "@material-ui/core";
import {logIn, logOut} from "../Redux/loginState";

export default function Home() {
    const history = useHistory();

    return (
        <div className="App">
            <HeaderBar/>
            <div className="Welcome-image">
                <div className='mask'>
                    <Button variant="contained"
                            color='Primary'
                            className="Button"
                            onClick={()=>{history.push('/sheets/new')}}>
                        Start Creating!
                    </Button>
                </div>
            </div>
            <div className='bottomWrapper'>
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
