import {Link, useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {selectLoggedIn, selectUsername} from "../Redux/loginState";

export default function Profile(){
    let profileUsername = useParams().username;
    const loggedIn = useSelector(selectLoggedIn);
    const username = useSelector(selectUsername);
    const isOwnProfile = loggedIn && username === profileUsername;
    console.log(username);

    return (isOwnProfile ?
        <div>
            <h2>Welcome to your profile, {profileUsername}</h2>

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
        :
        <div>
            <h2>Welcome to {profileUsername}'s profile </h2>

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
