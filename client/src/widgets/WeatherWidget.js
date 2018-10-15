import React, {Component} from 'react';

class WeatherWidget extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className="weather-container">
              <h1>Current: 23° C</h1>
              <span>Weather Forecast:</span>
              <li>20.10.2018 - 23° C</li>
              <li>21.10.2018 - 20° C</li>
              <li>22.10.2018 - 25° C</li>
            </div>
        );
    }
}

export default WeatherWidget;
