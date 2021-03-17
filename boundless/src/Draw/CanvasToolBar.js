import {useHistory, useParams, Link} from "react-router-dom";
import TwoCanvas from "../Draw/TwoCanvas";
import {HexColorPicker} from "react-colorful";
import {useDispatch, useSelector} from "react-redux";
import {changeColorPen, selectRGB} from "../Redux/rSlicePenOptions";
import {Box, Button, ButtonGroup, ClickAwayListener, Portal} from "@material-ui/core";
import styles from "../Stylesheets/CanvasPage.css";
import "../Stylesheets/CanvasToolBar.css";
import {logIn, logOut, selectLoggedIn} from "../Redux/loginState";
import {useState} from "react";


export const CanvasToolBar = () => {
}

export default CanvasToolBar;

