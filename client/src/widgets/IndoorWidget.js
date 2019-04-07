import React, {Component} from 'react';
import {socket} from '../socketConnection';
import '../font/css/weather-icons.css';
import '../font/css/custom.css';

export default class IndoorWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            temperature: null,
            humidity: null
        }
    }

    componentDidMount() {

        let app = this;
        socket.on('indoor_temperature', function (data) {
            app.setState({
                temperature: Math.round(data.temperature)
            })
        });

        socket.on('indoor_humidity', function (data) {
            app.setState({
                humidity: Math.round(data.humidity)
            })
        });

        const requestDhtValues = () => {
            console.log("Requesting values")
            socket.emit('web_indoor_values')
            this.setState({
                timeout: setTimeout(requestDhtValues, 120000)
            })
        }
        requestDhtValues(this.state.timeout);
    }

    componentWillUnmount() {
        clearTimeout(this.state.timeout)
    }


    render() {
        return (
            <div className="temperature-container">
                {this.state.temperature ? <p>Indoor Temperature: {this.state.temperature}°C</p> : null}
                {this.state.humidity ? <p>Indoor Humidity: {this.state.humidity}%</p> : null}
            </div>
        );
    }
}