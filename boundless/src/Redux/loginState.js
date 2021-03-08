import { createSlice } from '@reduxjs/toolkit';

// This file is essentially a 'slice' of our state. You can make multiple of these and then combine them in store.js.
// There's a lot of comments from the sample code, and I left them for you to read if you need them! - KK

export const slice = createSlice({
    // The name of the state piece. i.e., this is just a simple counter variable - KK
    name: 'loginState',
    //The initial state of your redux state variable, in this case an object with a 'value' field that starts at 0 - KK
    initialState: {
        loggedIn: false,
        username: ''
    },
    // These are all the actions you can take, and what they do. - KK
    reducers: {
        logIn: (state, action) => {
            state.loggedIn = true;
            state.username = action.payload;
        },
        logOut: state => {
            state.loggedIn = false;
        },
        changeUser: (state, action) => {
            state.username = action.payload;
        },
    },
});

//Gotta export the actions
export const { logIn, logOut, changeUser } = slice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectLoggedIn = state => state.loginState.loggedIn;
export const selectUsername = state => state.loginState.username;

// And this exports a slice of the overall reducer - KK
export default slice.reducer;
