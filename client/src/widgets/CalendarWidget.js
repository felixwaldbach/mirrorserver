import React, {Component} from 'react';
import {socket} from '../socketConnection';
import '../font/css/custom.css';

var calendar = [];

class CalendarWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userId: props.userId,
            calendar: []
        }
    }

    componentDidMount() {
        socket.emit('send_calendar_entries', {
            userId: this.state.userId
        });

        socket.on('calendar_entries', function (data) {
            refreshList();
            addDataToUI(data);
        });

        const addDataToUI = data => {
            if (data) {
                this.setState({calendar: data});
            }
        };

        const refreshList = () => {
            this.setState({calendar: []});
        }

        this.intervalID = setInterval(() => {
                socket.emit('send_calendar_entries', {
                    message: "send me calendar please!"
                })
            },
            900000 // 1 hour = 3600 seconds = 3 600 000 milliseconds, 900 000 = 15 min
        );
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    render() {
        calendar = this.state.calendar;

        return (
            <div className="calendar-container">

                {calendar.length == 0 ? <h2>No calendar set up!</h2>
                :
                    <div>
                        <h2>Calendar for today</h2>
                        <ul id={'calendar-list'}>
                            {
                                calendar.map(item => <li className={'calendar-item'}>{item.description} at {item.time}</li>)
                            }
                        </ul>
                    </div>
                }


            </div>
        );
    }
}

export default CalendarWidget;
