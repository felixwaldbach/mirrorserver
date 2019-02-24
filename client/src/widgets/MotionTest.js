import React, {Component} from 'react';
import {socket} from '../frontendConfig';
import '../font/css/custom.css';


class MotionTest extends Component {

    constructor(props) {
        super(props);
        this.state = {
            motion: 0
        }
    }

    componentDidMount() {
        socket.on('pir_motion_data', function (data) {
            addData(data);
        });

        const addData = data => {
            if (data) {
                this.setState({motion: data});
            }
        };


    }

    render() {
        return (
            <div>
                Motion: {this.state.motion}
            </div>
        );
    }
}

export default MotionTest;
