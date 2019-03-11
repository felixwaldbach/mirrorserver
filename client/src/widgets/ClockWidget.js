import React, {Component} from 'react';

import Clock from 'clock-react';
import '../font/css/custom.css';

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thurdsay", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

class ClockWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
          style: props.style,
          weekday: weekdays[new Date().getDay()],
          month: new Date().getMonth(),
          year: new Date().getFullYear()
        }
    }

    componentDidMount() {
      this.intervalID = setInterval(
        () => this.tick(),
        1000
      );
    }

    componentWillUnmount() {
      clearInterval(this.intervalID);
    }

    tick() {
      this.setState({weekday: new Date().getDay()}); // Sunday - Saturday : 0 - 6
      this.setState({date: new Date().getUTCDate()});
      if(this.state.date < 10) {
          this.setState({date: "0" + new Date().getUTCDate()});
      } else {
          this.setState({date: new Date().getUTCDate()});
      }
      if(this.state.month < 9) {
        this.setState({month: "0" + (new Date().getMonth() + 1)});
      } else {
        this.setState({month: new Date().getMonth() + 1});
      }
      this.setState({year: new Date().getFullYear()});
    }

    render() {
        return (
            <div className="clock-container">
              <h1><Clock /></h1>
              <h2>{weekdays[this.state.weekday]}, {this.state.date}.{this.state.month}.{this.state.year}</h2>
            </div>
        );
    }
}

export default ClockWidget;
