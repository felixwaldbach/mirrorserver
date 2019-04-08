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
        socket.on('outdoor_temperature', this.outdoorTemperatureListener.bind(this));

        socket.on('outdoor_humidity', this.outdoorHumidityListener.bind(this));

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
        socket.off('outdoor_temperature', this.outdoorTemperatureListener);
        socket.off('outdoor_humidity', this.outdoorHumidityListener);
    }

    outdoorHumidityListener(data) {
        this.setState({
            humidity: Math.round(data.humidity)
        })
    }

    outdoorTemperatureListener(data) {
        this.setState({
            temperature: Math.round(data.temperature)
        })
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