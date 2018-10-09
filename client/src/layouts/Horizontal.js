import React, {Component} from 'react';

import Grid from '@material-ui/core/Grid';


class Horizontal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            widgets: props.widgets,
        }
    }

    render() {
        return (
            <Grid container spacing={16}>
                <Grid item xs={3}>
                    {this.state.widgets[0]}
                </Grid>
                <Grid item xs={3}>
                    {this.state.widgets[1]}
                </Grid>
                <Grid item xs={3}>
                    {this.state.widgets[2]}
                </Grid>
                <Grid item xs={3}>
                    {this.state.widgets[3]}
                </Grid>

                <Grid item xs={12}>
                    This is intentionally left blank
                </Grid>
                <Grid item xs={3}>
                    {this.state.widgets[4]}
                </Grid>
                <Grid item xs={3}>
                    {this.state.widgets[5]}
                </Grid>
                <Grid item xs={3}>
                    {this.state.widgets[6]}
                </Grid>
                <Grid item xs={3}>
                    {this.state.widgets[7]}
                </Grid>

            </Grid>

        );
    }
}

export default Horizontal;