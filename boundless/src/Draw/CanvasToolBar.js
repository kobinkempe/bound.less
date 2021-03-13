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
    const [open, setOpen] = useState(false);
    const selectColor = useSelector(selectRGB);
    const dispatch = useDispatch();

    const handleClick = () => {
        setOpen((prev) => !prev);
    };

    const handleClickAway = () => {
        setOpen(false);
    };


    return (
    <ButtonGroup color={"primary"} className={'toolbar'} >
        <Button className={'toolbarSVG'}>
            <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 24 24" width="40">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-
                        .39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </Button>
        <Button className={'toolbarSVG'}>
            <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 24 24" width="40">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2
                        2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z"/>
            </svg>
        </Button>
        <Button className={'toolbarSVG'}>
            <svg xmlns="http://www.w3.org/2000/svg" height="40"
                 viewBox="0 0 24 24" width="40">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z"/>
            </svg>
        </Button>
        <ClickAwayListener onClickAway={handleClickAway}>
            <div>
                <Button className={'toolbarSVG'} onClick={handleClick}>
                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                         width="64.000000pt" height="64.000000pt" viewBox="0 0 1280.000000 1280.000000"
                         preserveAspectRatio="xMidYMid meet">
                        <g transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
                           fill="#000000" stroke="none">
                            <path d="M6135 11194 c-1192 -76 -2249 -543 -3088 -1364 -762 -745 -1247
                                        -1695 -1396 -2737 -38 -261 -46 -384 -45 -698 0 -443 38 -760 139 -1165 89
                                        -351 181 -602 350 -945 185 -376 364 -652 636 -980 118 -143 461 -481 616
                                        -608 711 -581 1539 -940 2440 -1057 312 -41 690 -50 798 -20 182 51 328 143
                                        434 275 130 161 191 350 177 555 -12 197 -68 325 -219 505 -67 80 -137 216
                                        -163 320 -25 96 -25 285 0 380 63 243 225 437 449 540 149 68 141 67 887 75
                                        371 4 686 10 700 13 14 4 70 13 125 22 536 84 1050 351 1447 752 324 327 539
                                        688 672 1133 108 360 133 810 70 1265 -186 1335 -1066 2512 -2379 3180 -582
                                        296 -1185 471 -1865 540 -147 15 -654 27 -785 19z m-840 -1094 c272 -86 474
                                        -296 547 -568 28 -109 28 -287 -1 -397 -74 -281 -295 -502 -576 -576 -114 -30
                                        -280 -30 -394 0 -277 73 -484 271 -571 546 -28 90 -38 267 -20 368 54 313 301
                                        570 614 642 94 22 312 14 401 -15z m2603 15 c315 -66 567 -325 622 -642 18
                                        -101 8 -278 -20 -368 -87 -275 -294 -473 -571 -546 -114 -30 -280 -30 -394 0
                                        -281 74 -502 295 -576 576 -30 112 -30 289 0 399 79 297 323 527 622 585 71
                                        14 242 12 317 -4z m-4308 -2126 c177 -28 313 -100 445 -233 133 -134 200 -272
                                        225 -464 32 -245 -61 -496 -247 -673 -98 -94 -201 -151 -340 -191 -102 -29
                                        -304 -31 -403 -4 -362 99 -600 408 -600 775 0 165 42 311 127 439 175 263 486
                                        401 793 351z m5958 -19 c348 -98 582 -408 582 -770 0 -165 -39 -297 -126 -433
                                        -250 -387 -770 -483 -1146 -210 -122 88 -238 250 -286 399 -88 271 -20 577
                                          175 785 123 130 271 213 438 245 96 19 269 11 363 -16z"/>
                        </g>
                    </svg>
                </Button>
                {open ? (
                    <Portal>
                        <div className='colorPickerWrapperC'>
                            <HexColorPicker className={styles.small}
                                            color={selectColor}
                                            onChange={(c) => {dispatch(changeColorPen(c))}}/>
                        </div>
                    </Portal>
                ) :null}
            </div>
        </ClickAwayListener>
        <Button className={'toolbarSVG'}>
            <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 24 24" width="40">
                <path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12
                        5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </Button>

    </ButtonGroup>
    );
}

export default CanvasToolBar;

