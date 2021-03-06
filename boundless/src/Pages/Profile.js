import {Link, useParams} from "react-router-dom";

export default function Profile(){
    let {username} = useParams();
    return (
        <div>
            <h2>Welcome to your profile {username}</h2>

            <ul>
                <li>
                    <Link to={`/canvas/1`}>Canvas #1</Link>
                </li>
                <li>
                    <Link to={`/canvas/2`}>
                        Canvas #2
                    </Link>
                </li>
            </ul>
        </div>
    )
}
*/
