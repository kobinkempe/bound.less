import './App.css';
import heyworld from "./oleTom.js";
import {
  incrementByAmount,
  selectCount,
} from './Redux/reducerSliceOne'
import {useDispatch, useSelector} from "react-redux";

function App() {
  const count = useSelector(selectCount);
  const dispatch = useDispatch();

  return (
    <div className="App">
      <header className="App-header">
        <heyworld/>
        <p>
          {count}
        </p>
        <button onClick={()=>{dispatch(incrementByAmount(2))}}>
          increment by 2
        </button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
