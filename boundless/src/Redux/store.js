import { configureStore } from '@reduxjs/toolkit';
import reducerOne from './reducerSliceOne';
import reducerPenRGB from './rSlicePenOptions';
import reducerCanvState from './UndoQueueState';
import loginState from "./loginState";

//Here is where we store the state information. This combines all the reducers we may want to use - KK
export default configureStore({
    reducer: {
        counter: reducerOne,
        penColor: reducerPenRGB,
        undoQueue: reducerCanvState,
        loginState: loginState
    },
});
