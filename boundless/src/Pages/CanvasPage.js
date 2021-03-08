import {useParams} from "react-router-dom";
import Canvas from "../Draw/Canvas"
import twoCanvas from "../Draw/TwoCanvas";
import TwoCanvas from "../Draw/TwoCanvas";
import {HexColorPicker} from "react-colorful";
import {useDispatch, useSelector} from "react-redux";
import {changeColorPen, selectRGB} from "../Redux/rSlicePenOptions";
import {useEffect, useState} from "react";
import {Box} from "@material-ui/core";
import styles from "../Stylesheets/CanvasPage.css";


export const CanvasPage = ({canvasID}) => {
    let {canvasId} = useParams();
    const selectColor = useSelector(selectRGB);
    const colorDispatch = useDispatch();


    return (
        <div>
            <Box flexDirection={'row'}>
            <div>
                <h3>You are viewing canvas #{canvasID}</h3>
            </div>
            <HexColorPicker className={styles.small}
                            color={selectColor}
                            onChange={(c) => {colorDispatch(changeColorPen(c))}}/>
            </Box>
            <TwoCanvas/>
        </div>
    )
}
