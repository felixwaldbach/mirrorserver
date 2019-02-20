// https://openweathermap.org/current
// api.openweathermap.org/data/2.5/weather?q=Stuttgart&APPID=ba26397fa9d26d3655feda1b51d4b79d
// Please, always use your API keys as &APPID=ba26397fa9d26d3655feda1b51d4b79d in any queries.

// 5 day forecast api: api.openweathermap.org/data/2.5/forecast?q=Stuttgart,DE&APPID=ba26397fa9d26d3655feda1b51d4b79d
//       https://openweathermap.org/forecast5

import React, {Component} from 'react';
import {socket} from '../frontendConfig';
import '../font/css/weather-icons.css';
import '../font/css/custom.css';

var five_day_forecast = [];

class WeatherWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            city: "",
            current_indoor_temperature: 0,
            current_outdoor_temperature: 0,
            five_day_forecast: []
        }
    }

    componentDidMount() {
        socket.emit('send_weather_forecast', {
            message: "send me forecast please!"
        });

        socket.on('required_city_weather', function (data) {
            console.log(data);
            refreshList();
            refreshCity();
            addCityToUI(data);
        });

        const refreshList = () => {
            this.setState({five_day_forecast: []});
        }

        const refreshCity = () => {
            this.setState({city: ""});
        }

        const addCityToUI = data => {
            if (data) {
                this.setState({city: data});
                // get getFiveDayForecast
                this.getFiveDayForecast();
            }
        };
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    async getFiveDayForecast() {
        console.log("soon...");
    }

    render() {
        five_day_forecast = this.state.five_day_forecast;

        return (
            <div className="weather-container">

                <h3>Weather for {this.state.city}</h3>

                <table>
                    <tr id="head-border">
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thur</th>
                        <th>Fri</th>
                    </tr>
                    <tr>
                        <td><i className="wi wi-day-sunny"></i></td>
                        <td><i className="wi wi-day-storm-showers"></i></td>
                        <td><i className="wi wi-solar-eclipse"></i></td>
                        <td><i className="wi wi-day-light-wind"></i></td>
                        <td><i className="wi wi-day-cloudy-high"></i></td>
                    </tr>
                    <tr>
                        <td>22° C</td>
                        <td>33° C</td>
                        <td>45° C</td>
                        <td>23° C</td>
                        <td>24° C</td>
                    </tr>
                </table>

                <h3>Indoor: {this.state.current_indoor_temperature}°
                    C <br/> Outdoor: {this.state.current_indoor_temperature}° C</h3>

            </div>
        );
    }
}

export default WeatherWidget;
