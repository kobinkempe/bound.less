import { configureStore } from '@reduxjs/toolkit';
import reducerOne from './reducerSliceOne';

export default configureStore({
    reducer: {
        counter: reducerOne
    },
});
