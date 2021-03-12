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
                            <text>Your Bound.less Sheets</text>
                            <text>View All</text>
                        </div>
                        <div className='sheetBox'>
                            <div className='sheetCaptionImage'>
                                <div className='sheetThumbnail'/>
                                <text>New Sheet</text>
                            </div>
                            <div className='sheetCaptionImage'>
                                <div className='sheetThumbnail'/>
                                <text>New Sheet</text>
                            </div>
                            <div className='sheetCaptionImage'>
                                <div className='sheetThumbnail'/>
                                <text>New Sheet</text>
                            </div>
                            <div className='sheetCaptionImage'>
                                <div className='sheetThumbnail'/>
                                <text>New Sheet</text>
                            </div>
                            <div className='sheetCaptionImage'>
                                <div className='sheetThumbnail'/>
                                <text>New Sheet</text>
                            </div>
                            <div className='sheetCaptionImage'>
                                <div className='sheetThumbnail'/>
                                <text>New Sheet</text>
                            </div>
                        </div>
                    </div>
                    <div className='sheetSection'>
                        <div className='heading'>
                            <text>Saved Bound.less Sheets</text>
                            <text>View All</text>
                        </div>
                        <div className='sheetBox'>
                            <div className='sheetCaptionImage'>
                                <div className='sheetThumbnail'/>
                                <text>New Sheet</text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
