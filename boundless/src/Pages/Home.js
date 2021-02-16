import '../Stylesheets/Home.css';
import {
    incrementByAmount,
    selectCount,
} from '../Redux/reducerSliceOne'
import {useDispatch, useSelector} from "react-redux";

export default function Home() {
    const count = useSelector(selectCount);
    const dispatch = useDispatch();

    return (
        <div className="App">
            <header className="App-header">
                <text>
                    Hook/Redux State Example (below)
                </text>
                <p>
                    {count}
                </p>
                <button onClick={()=>{dispatch(incrementByAmount(2))}}>
                    Increment by 2
                </button>
            </header>
        </div>
    );
}
