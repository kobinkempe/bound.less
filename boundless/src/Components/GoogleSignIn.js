import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from '../Firebase.js';
import '../Stylesheets/Home.css';
import {logIn, logOut, selectLoggedIn, selectUsername} from "../Redux/loginState";

import store from '../Redux/store.js';

export default class SignInScreen extends React.Component {

    // The component's Local state.
    state = {
        isSignedIn: false // Local signed-in state.
    };

    // Configure FirebaseUI.
    uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Google as auth provider.
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: () => {
                this.props.store.dispatch(logIn(firebase.auth().currentUser.displayName));
                console.log(this.props.store.getState());
                console.log(store.getState());
                return false;
            }
        },
        // Terms of service url.
        tosUrl: '<your-tos-url>',
        // Privacy policy url.
        privacyPolicyUrl: '<your-privacy-policy-url>'
    };

    // Listen to the Firebase Auth state and set the local state.
    componentDidMount() {
        this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
            (user) => this.setState({isSignedIn: !!user})
        );
    }

    // Make sure we un-register Firebase observers when the component unmounts.
    componentWillUnmount() {
        this.unregisterAuthObserver();
    }

    render() {
        if (!this.state.isSignedIn) {
            return (
                <div>
                    <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
                </div>
            );
        }
        return (
            <div>
                <p className="Header-text">Welcome {firebase.auth().currentUser.displayName}! You are now signed-in!</p>
                <a onClick={() => firebase.auth().signOut()} className="Header-text">Log Out</a>
            </div>
        );
    }
}
