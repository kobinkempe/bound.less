import '../Stylesheets/Profile.css'
import {Link, useParams} from "react-router-dom";
import HeaderBar from "../Components/headerBar";
import CanvasThumbnail from "../Components/canvasThumbnail";

export default function Profile(){
    let {username} = useParams();
    return (
        <div>
            <HeaderBar profilePage={true}/>
            <div className='screen'>
                <div className='container'>
                    <div className='topSection'>
                        <div className='userImage'/>
                        <div className='captionText'>
                            <text>{username}</text>
                        </div>
                    </div>
                    <div className='sheetSection'>
                        <div className='heading'>
                            <text>Your bound.less Canvases</text>
                            <a className='viewAll' href='#/profile/view-all'>
                                View All
                            </a>
                        </div>
                        <div className='sheetBox'>
                            <CanvasThumbnail
                                href={'#/canvas/new'}
                                text={'New Canvas'}
                                newCanvas={true}/>
                        </div>
                    </div>
                    <div className='sheetSection'>
                        <div className='heading'>
                            <text>Saved bound.less Canvases</text>
                            <text>View All</text>
                        </div>
                        <div className='sheetBox'>
                            <CanvasThumbnail
                                href={'#/canvas/liked1'}
                                text={'Liked Canvas 1'}
                                newCanvas={false}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
