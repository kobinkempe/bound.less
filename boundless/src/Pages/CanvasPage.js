import {useParams} from "react-router-dom";
import Canvas from "../Draw/Canvas"



export const CanvasPage = () => {
    let {canvasId} = useParams();
    return (
        <div>
            <h3>You are viewing canvas #{canvasId}</h3>
            <Canvas />
        </div>
    )
}
