import {Link, useParams} from "react-router-dom";
import HeaderBar from "../Components/headerBar";

export default function Profile(){
    let {username} = useParams();
    return (
        <div>
            <HeaderBar/>
            <h2>Welcome to your profile, {username}</h2>

            <ul>
                <li>
                    <Link to={`/sheets/1`}>Canvas #1</Link>
                </li>
                <li>
                    <Link to={`/sheets/2`}>
                        Canvas #2
                    </Link>
                </li>
            </ul>
        </div>
    )
}
