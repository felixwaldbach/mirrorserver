// https://openweathermap.org/current
// api.openweathermap.org/data/2.5/weather?q=Stuttgart&APPID=ba26397fa9d26d3655feda1b51d4b79d
// Please, always use your API keys as &APPID=ba26397fa9d26d3655feda1b51d4b79d in any queries.

import React, {Component} from 'react';
import $ from 'jquery';
import kelvinToCelsius from 'kelvin-to-celsius';

class WeatherWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
          current_temperature: 0
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
          this.setState({current_temperature: temperature});
        }.bind(this),
        error: function(xhr, status, err){
          console.log(err);
        }
      });

    }

    render() {

        return (
            <div className="weather-container">
              <h1>Current: {this.state.current_temperature}° C</h1>
              <span>Weather Forecast:</span>
              <li>20.10.2018 - 99° C</li>

            </div>
        );
    }
}

export default WeatherWidget;
