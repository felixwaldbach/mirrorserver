// https://openweathermap.org/current
// api.openweathermap.org/data/2.5/weather?q=Stuttgart&APPID=ba26397fa9d26d3655feda1b51d4b79d
// Please, always use your API keys as &APPID=ba26397fa9d26d3655feda1b51d4b79d in any queries.

// 5 day forecast api: api.openweathermap.org/data/2.5/forecast?q=Stuttgart,DE&APPID=ba26397fa9d26d3655feda1b51d4b79d
//       https://openweathermap.org/forecast5

import React, {Component} from 'react';
import $ from 'jquery';
import kelvinToCelsius from 'kelvin-to-celsius';
import socketIOClient from "socket.io-client";
import frontendConfig from '../frontendConfig';
import '../css/weather-icons.css';
import '../font/css/custom.css';

var five_day_forecast = [];

class WeatherWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            current_indoor_temperature: 0,
            current_outdoor_temperature: 0,
            five_day_forecast: [],
            endpoint: frontendConfig.server_address + ':' + frontendConfig.socket_server_port
        }
    }

    componentDidMount() {
        // WebSockets
        this.socket = socketIOClient(this.state.endpoint);
        this.socket.emit('send_weather_forecast', {
            message: "send me forecast please!"
        });

        this.socket.on('five_day_forecast', function (data) {
            addWeatherForecastToUI(data);
        });

        this.intervalID = setInterval( () => {
            this.socket.emit('send_weather_forecast', {
                message: "send me forecast please!"
            })},
            3600000 // 1 hour = 3600 seconds = 3600000 milliseconds
        );

        const addWeatherForecastToUI = data => {
            if(data) {
                console.log(JSON.parse(data.forecast));
            }
        };
    }

    componentWillUnmount() {
      clearInterval(this.intervalID);
    }



    render() {
        five_day_forecast = this.state.five_day_forecast;

        return (
            <div className="weather-container">
                <h2>Indoor: {this.state.current_indoor_temperature}° C <br /> Outdoor: {this.state.current_indoor_temperature}° C</h2>

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
            </div>
        );
    }
}

export default WeatherWidget;
