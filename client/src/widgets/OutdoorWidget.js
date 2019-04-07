import React, {Component} from 'react';
import {socket} from '../socketConnection';
import '../font/css/weather-icons.css';
import '../font/css/custom.css';

export default class OutdoorWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            temperature: null,
            humidity: null
        }
    }

    componentDidMount() {

        let app = this;
        socket.on('outdoor_temperature', function (data) {
            app.setState({
                temperature: Math.round(data.temperature)
            })
        });

        socket.on('outdoor_humidity', function (data) {
            app.setState({
                humidity: Math.round(data.humidity)
            })
        });

        const requestDhtValues = () => {
            console.log("Requesting values")
            socket.emit('web_outdoor_values')
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
                {this.state.temperature ? <p>Outdoor Temperature: {this.state.temperature}°C</p> : null}
                {this.state.humidity ? <p>Outdoor Humidity: {this.state.humidity}%</p> : null}
            </div>
        );
    }
}