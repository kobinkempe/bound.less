import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import "../../Stylesheets/CanvasToolBar.css";
import {Slider} from "@material-ui/core";




export default function ContinuousSlider({onClick}) {
    const [value, setValue] = React.useState(ref);

    const handleChange = (event, newValue) => {
        onClick(newValue);
    };

    return (
        <div className={'toolbar'}>
            <Typography id="continuous-slider" gutterBottom>
                {value}
            </Typography>
            <Grid container spacing={2}>
                <Grid item>
                </Grid>
                <Grid item xs>
                    <Slider value={value} onChange={handleChange} aria-labelledby="continuous-slider" />
                </Grid>
                <Grid item>
                </Grid>
            </Grid>
        </div>
    );
}
