import {useParams} from "react-router-dom";
import Canvas from "../Draw/Canvas"
import twoCanvas from "../Draw/TwoCanvas";
import TwoCanvas from "../Draw/TwoCanvas";



export default function CanvasPage(){
    let {canvasId} = useParams();
    return (
        <div>
            <h3>You are viewing canvas #{canvasId}</h3>
            <Canvas/>
        </div>
    )
}
