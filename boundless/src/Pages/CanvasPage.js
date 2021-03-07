import {useParams} from "react-router-dom";
import Canvas from "../Draw/Canvas"
import twoCanvas from "../Draw/TwoCanvas";
import TwoCanvas from "../Draw/TwoCanvas";



export const CanvasPage = ({canvasID}) => {
    let {canvasId} = useParams();
    return (
        <div>
            <h3>You are viewing canvas #{canvasID}</h3>
            <TwoCanvas/>
        </div>
    )
}
