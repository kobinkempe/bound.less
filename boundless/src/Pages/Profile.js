import {Link} from "react-router-dom";

import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {useParams} from "react-router-dom";
import {Grid} from "@material-ui/core";

const profStyles = makeStyles((theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            colo: theme.palette.text.secondary,
        },

        text: {
            fontFamily: "Roboto",
            fontSize:20,
            fontWeight: "bold"
        }
    }),
);




export default function Profile() {

    const logo = require('../Resources/smileHead.jpg')
    const styles = profStyles();


    return (
        <div className={styles.root}>
            <Grid container
                  spacing={3}
                  direction="column">
                <Grid item xs={12}>
                    <text className={styles.text}>Your Profile!</text>
                </Grid>
                <Grid container spacing={3} direction="row">
                    <Grid item xs={6}>
                        <img src={logo}/>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={styles.paper}>
                            <Link to={'/canvas/1'}>Canvas #1</Link>
                        </Paper>
                        <Paper className={styles.paper}>
                            <Link to={'/canvas/2'}>Canvas #2</Link>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
}
        /*
    return (
        <div className={styles.root}>
            <h2>Your profile</h2>

            <ul>
                <li>
                    <Link to={`/canvas/1`}>Canvas #1</Link>
                </li>
                <li>
                    <Link to={`/canvas/2`}>
                        Canvas #2
                    </Link>
                </li>
            </ul>
        </div>
    )
}
*/
