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
                                <text>{username}</text>
                            </div>
                            <div className='caption'>
                                <text>Description.</text>
                            </div>
                        </div>

                    </div>
                    {/*<div className='sheetSection'>*/}
                    {/*    <div className='heading'>*/}
                    {/*        <text>Your bound.less Canvases</text>*/}
                    {/*        <a className='viewAll' href={'#/profile/' + {username} + '/view-all'}>*/}
                    {/*            View All*/}
                    {/*        </a>*/}
                    {/*    </div>*/}
                    {/*    <div className='sheetBox'>*/}
                    {/*        <CanvasThumbnail*/}
                    {/*            href={'#/canvas/new'}*/}
                    {/*            text={'New Canvas'}*/}
                    {/*            newCanvas={true}/>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <AllCanvasThumbnail/>
                </div>
            </div>
        </div>
    )
}
