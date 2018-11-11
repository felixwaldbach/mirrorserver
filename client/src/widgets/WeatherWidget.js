// https://openweathermap.org/current
// api.openweathermap.org/data/2.5/weather?q=Stuttgart&APPID=ba26397fa9d26d3655feda1b51d4b79d
// Please, always use your API keys as &APPID=ba26397fa9d26d3655feda1b51d4b79d in any queries.

// 5 day forecast api: api.openweathermap.org/data/2.5/forecast?q=Stuttgart,DE&APPID=ba26397fa9d26d3655feda1b51d4b79d
//       https://openweathermap.org/forecast5

import React, {Component} from 'react';
import $ from 'jquery';
import kelvinToCelsius from 'kelvin-to-celsius';
import '../css/weather-icons.css';
import '../font/css/custom.css';

class WeatherWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            current_indoor_temperature: 0,
            current_outdoor_temperature: 0
        }
    }

    componentDidMount() {
      this.callApi()
          .then(res => this.setState({response: res}))
          .catch(err => console.log(err));

      this.intervalID = setInterval(
        () => this.callApi()
            .then(res => this.setState({response: res}))
            .catch(err => console.log(err)),
        3600000 // 1 hour = 3600 seconds = 3600000 milliseconds
      );
    }

    componentWillUnmount() {
      clearInterval(this.intervalID);
    }


    callApi = async () => {
      //https://talaikis.com/random_quotes_api/
      //reload quote every 2 hour

      $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=Stuttgart&APPID=ba26397fa9d26d3655feda1b51d4b79d",
        dataType: 'json',
        cache: false,
        type: "GET",
        success: function(data) {
          let temperature = kelvinToCelsius(data.main.temp);
          console.log(data.main.temp);
          console.log(kelvinToCelsius(data.main.temp));
          this.setState({current_indoor_temperature: temperature});
        }.bind(this),
        error: function(xhr, status, err){
          console.log(err);
        }
      });

    }

    render() {

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
