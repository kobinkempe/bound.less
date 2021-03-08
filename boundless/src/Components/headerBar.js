import '../Stylesheets/headerBar.css';
import {Box, Button} from "@material-ui/core";
import {logIn, logOut} from "../Redux/loginState";

export default function headerBar(){
    return(
        <Box className='headerBar'>
            <h1>Bound.less</h1>
            <div>
                <Button onClick={()=>{dispatch(logIn('johnDoe'))}}>Log In as John Doe</Button>
                <Button onClick={()=>{dispatch(logIn('janeDoe'))}}>Log In as Jane Doe</Button>
                <Button onClick={()=>{dispatch(logOut)}}>Log Out</Button>
            </div>
        </Box>
    )
}