import '../Stylesheets/canvasThumbnail.css'

export default function CanvasThumbnail({href, text, newCanvas}) {

    return (

        <div className='sheetCaptionImage'>
            <a href={href}>
                {newCanvas?
                    <div className='newCanvas'/>:
                    <div className='likedCanvas'/>
                }
            </a>
            <text>{text}</text>
        </div>

    )
}