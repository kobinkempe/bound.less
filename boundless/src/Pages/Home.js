import '../Stylesheets/Home.css';
import {useDispatch} from "react-redux";
import HeaderBar from "../Components/headerBar";
import {Link} from "react-router-dom";
import {Box, Button} from "@material-ui/core";
import {logIn, logOut} from "../Redux/loginState";

export default function Home() {
    const dispatch = useDispatch();

    return (
        <div className="App">
            <HeaderBar/>
            <div className="Welcome-image">
                <div className='mask'>
                    <Button variant="contained" color='Primary' className="Button" href={'/#/sheets/new'}>
                        Start Creating!
                    </Button>
                </div>
            </div>
            <div className='bottomWrapper'>
                <div className='sideText'>
                    <p className='text2'>   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent id augue
                        nec erat congue blandit. Praesent tempus est erat, quis pellentesque justo semper eget. Quisque
                        vitae lorem odio. Suspendisse potenti. Morbi non dapibus leo, nec placerat tortor. Nullam vitae
                        vulputate erat. Proin ante diam, sodales id metus vel, tincidunt porta quam. Aliquam erat
                        volutpat. Quisque eget lorem diam. Quisque pharetra turpis eget mi congue euismod. Fusce
                        finibus, risus ac cursus faucibus, risus mauris interdum purus, sit amet sodales tellus ligula
                        sit amet mi. Nullam non erat lobortis, aliquet quam in, feugiat dui. Pellentesque habitant morbi
                        tristique senectus et netus et malesuada fames ac turpis egestas.</p>
                </div>
            </div>

        </div>
    );
}
