import React, {Component} from 'react';

import Clock from 'clock-react';

class ClockWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            style: props.style
        }
    }

    state = {
        response: ''
    };

    render() {
        return (
            <Clock style={this.state.style}/>
        );
    }
}

export default ClockWidget;