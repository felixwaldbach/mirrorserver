import React, {Component} from 'react';
import {socket} from '../frontendConfig';
import '../font/css/weather-icons.css';
import '../font/css/custom.css';

var forecast = [];

class WeatherWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            city: "",
            forecast: []
        }
    }

    componentDidMount() {
        socket.emit('send_weather_forecast', {
            message: "send me forecast please!"
        });

        socket.on('temperature_inside_data', function (data) {
            addDataToInsideTemperature(data);
        });

        const addDataToInsideTemperature = data => {
            if (data) {
                this.setState({current_indoor_temperature: data});
            }
        };

        socket.on('temperature_outside_data', function (data) {
            addDataToOutsideTemperature(data);
        });

        const addDataToOutsideTemperature = data => {
            if (data) {
                this.setState({current_outdoor_temperature: data});
            }
        };

        socket.on('required_city_weather', function (data) {
            refreshList();
            refreshCity();
            addCityToUI(data);
        });

        const refreshList = () => {
            this.setState({forecast: []});
        }

        const refreshCity = () => {
            this.setState({city: ""});
        }

        const addCityToUI = data => {
            if (data) {
                this.setState({city: data.city});
                this.setState({forecast: data.forecast});
            }
        };

        this.intervalID = setInterval(() => {
                socket.emit('send_weather_forecast', {
                    message: "send me forecast please!"
                })
            },
            3600000 // 1 hour = 3600 seconds = 3600000 milliseconds
        );
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    render() {
        forecast = this.state.forecast;

        return (
            <div className="weather-container">

                {forecast.length == 0 ? <h3>No forecast available for {this.state.city}</h3> : <h3>Weather for {this.state.city}</h3>}

                <table>
                    <tr id="head-border">
                        {forecast.map((item, index) => {
                                return (
                                    <th key={index}>
                                        {item.weekday.substring(0, 3)}
                                    </th>
                                )
                            }
                        )}
                    </tr>
                    <tr>
                        {forecast.map((item, index) => {
                                return (
                                    <td key={index}>
                                        {index !== undefined ? <i className={item.icon}></i> : <i className="wi wi-na"></i>}
                                    </td>
                                )
                            }
                        )}
                    </tr>
                    <tr>
                        {forecast.map((item, index) => {
                                return (
                                    <td>{item.temp} °C</td>
                                )
                            }
                        )}
                    </tr>
                </table>

                <h3>
                    {this.state.current_indoor_temperature ?
                        <span>
                            Indoor: {this.state.current_indoor_temperature} °C
                            <br/>
                            Outdoor: {this.state.current_outdoor_temperature} °C
                        </span>
                    : null}
                </h3>

            </div>
        );
    }
}

export default WeatherWidget;
