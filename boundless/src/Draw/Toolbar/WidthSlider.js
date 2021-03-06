import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import "../../Stylesheets/CanvasToolBar.css";
import {Slider} from "@material-ui/core";




export default function WidthSlider({onClick, lineWidth}) {
    const [value, setValue] = React.useState(lineWidth);

    const handleChange = (event, newValue) => {
        setValue(lineWidth);
        onClick(newValue);
    };

    return (
        <div>
            <Typography id="continuous-slider" gutterBottom align={'center'}>
                {value}
            </Typography>
            <Grid container spacing={2}>
                <Grid item>
                </Grid>
                <Grid item xs>
                    <Slider style={{'width': 100}}
                            min={1}
                            max={90}
                            value={value}
                            onChange={handleChange}
                            color = 'rgb(0,0,0)'
                            aria-labelledby="continuous-slider" />

                </Grid>
                <Grid item>
                </Grid>
            </Grid>
        </div>
    );
}
