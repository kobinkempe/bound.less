import '../Stylesheets/Profile.css'
import {Link, useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {selectLoggedIn, selectUsername} from "../Redux/loginState";
import HeaderBar from "../Components/headerBar";
import CanvasThumbnail from "../Components/canvasThumbnail";
import AllCanvasThumbnail from "../Components/allCanvasThumbnail";

export default function Profile() {
    let profileUsername = useParams().username;
    const loggedIn = useSelector(selectLoggedIn);
    const username = useSelector(selectUsername);
    const isOwnProfile = loggedIn && username === profileUsername;

    return (
        <div>
            <HeaderBar profilePage={true}/>
            <div className='screen'>
                <div className='container'>
                    <div className='topSection'>
                        <div className='userImage'/>
                        <div className='captionText'>
                            <div className='username'>
                                <text>{profileUsername}</text>
                            </div>
                            <div className='caption'>
                                <text>Created X Canvases</text>
                            </div>
                        </div>
                    </div>
                    <div className='captionThumbnail'>
                        <text>All Canvases</text>
                    </div>
                    <AllCanvasThumbnail/>
                </div>
            </div>
        </div>
    )
}
