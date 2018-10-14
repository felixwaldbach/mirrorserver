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
            <div>
              <Clock style={this.state.style}/>
            </div>
        );
    }
}

export default ClockWidget;
