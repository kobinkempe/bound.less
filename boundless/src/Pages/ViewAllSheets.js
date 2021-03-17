import '../Stylesheets/ViewAllSheets.css'
import HeaderBar from "../Components/headerBar";
import CanvasThumbnail from "../Components/canvasThumbnail";

export default function Profile(){

    // Need a handler to get all the user's templates.

    return (
        <div>
            <HeaderBar/>
            <div className="grid-container">
                <CanvasThumbnail
                    href={'#/canvas/new'}
                    text={'New Canvas'}
                    newCanvas={true}/>
                <CanvasThumbnail
                    href={'#/canvas/new'}
                    text={'Canvas 1'}
                    newCanvas={false}/>
                <CanvasThumbnail
                    href={'#/canvas/new'}
                    text={'Canvas 2'}
                    newCanvas={false}/>
                <CanvasThumbnail
                    href={'#/canvas/new'}
                    text={'Canvas 3'}
                    newCanvas={false}/>
            </div>
        </div>
    )
}