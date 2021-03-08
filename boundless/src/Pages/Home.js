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
                <div className="Welcome-message">
                    <h2 className="">Welcome to bound.less!</h2>
                    <h2>Start creating today!</h2>
                </div>

                <img src="https://digitalworkplace.global.fujitsu.com/wp-content/uploads/2018/07/image-for-spain-infographic-1200x968.jpg" className="Welcome-image"/>
            </header>
        </div>
    );
}
