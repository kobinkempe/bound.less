import '../Stylesheets/Profile.css'
import {Link, useParams} from "react-router-dom";
import HeaderBar from "../Components/headerBar";

export default function Profile(){
    let {username} = useParams();
    return (
        <div>
            <HeaderBar/>
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
                            <text>View All</text>
                        </div>
                        <div className='sheetBox'>
                            <a className='sheetCaptionImage' href='/sheets/new'>
                                <div className='newCanvas' />
                            </a>
                            <text>New Canvas</text>
                        </div>
                    </div>
                    <div className='sheetSection'>
                        <div className='heading'>
                            <text>Saved bound.less Canvases</text>
                            <text>View All</text>
                        </div>
                        <div className='sheetBox'>
                            <a className='sheetCaptionImage' href='/sheets/new'>
                                <div className='likedCanvas' />
                            </a>
                            <text>Liked Canvas</text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
