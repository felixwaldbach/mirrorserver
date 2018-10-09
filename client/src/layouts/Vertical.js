import React, {Component} from 'react';

import {Grid} from 'semantic-ui-react'

class Vertical extends Component {

    constructor(props) {
        super(props);
        this.state = {
            widgets: props.widgets,
        }
    }

    render() {
        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column width={4}>
                        <p>
                            <span>{this.state.widgets[0]}</span>
                        </p>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <p>
                            <span>Four</span>
                        </p>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <p>
                            <span>Four</span>
                        </p>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <p>
                            <span>Four</span>
                        </p>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={4}>
                    <Grid.Column floated='left'>
                        <p>
                            <span>Left 1</span>
                        </p>
                    </Grid.Column>
                    <Grid.Column floated='right'>
                        <p>
                            <span>Right 1</span>
                        </p>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={4}>
                    <Grid.Column floated='left'>
                        <p>
                            <span>Left 2</span>
                        </p>
                    </Grid.Column>
                    <Grid.Column floated='right'>
                        <p>
                            <span>Right 2</span>
                        </p>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={4}>
                    <Grid.Column floated='left'>
                        <p>
                            <span>Left 3</span>
                        </p>
                    </Grid.Column>
                    <Grid.Column floated='right'>
                        <p>
                            <span>Right 3</span>
                        </p>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={4}>
                    <Grid.Column floated='left'>
                        <p>
                            <span>Left 4</span>
                        </p>
                    </Grid.Column>
                    <Grid.Column floated='right'>
                        <p>
                            <span>Right 4</span>
                        </p>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width={4}>
                        <p>
                            <span>Four</span>
                        </p>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <p>
                            <span>Four</span>
                        </p>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <p>
                            <span>Four</span>
                        </p>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <p>
                            <span>Four</span>
                        </p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export default Vertical;