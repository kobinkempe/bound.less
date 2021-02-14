import {useParams} from "react-router-dom";

export default function Canvas(){
    let {canvasId} = useParams();
    return <h3>You are viewing canvas #{canvasId}</h3>;
}