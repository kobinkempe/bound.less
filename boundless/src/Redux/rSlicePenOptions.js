import { createSlice } from '@reduxjs/toolkit';
import Two from "two.js";

// This file is essentially a 'slice' of our state. You can make multiple of these and then combine them in store.js.
// There's a lot of comments from the sample code, and I left them for you to read if you need them! - KK

export const slice = createSlice({
    // The name of the state piece. i.e., this is just a simple counter variable - KK
    name: 'penColor',
    //The initial state of your redux state variable, in this case an object with a 'value' field that starts at 0 - KK
    initialState: {
        value: 'rgb(40,0,0)',
    },
    // These are all the actions you can take, and what they do. - KK
    reducers: {
        rgbPen: (state, newSVG) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            // You can tell I didn't write that comment cuz I don't know what it means - KK
            state.value = newSVG;
        },
    },
});

//Gotta export the actions
export const { rgbPen } = slice.actions;



// And this exports a slice of the overall reducer - KK
export default slice.reducer;
