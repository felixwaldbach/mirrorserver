import React, {Component} from 'react';
import {socket} from '../socketConnection';
import '../font/css/custom.css';

var calender = [];

class CalenderWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userId: props.userId,
            calender: []
        }
    }

    componentDidMount() {
        socket.emit('send_calender_entries', {
            userId: this.state.userId
        });

        socket.on('calender_entries', function (data) {
            refreshList();
            addDataToUI(data);
        });

        const addDataToUI = data => {
            if (data) {
                this.setState({calender: data});
            }
        };

        const refreshList = () => {
            this.setState({calender: []});
        }

        this.intervalID = setInterval(() => {
                socket.emit('send_calender_entries', {
                    message: "send me calender please!"
                })
            },
            900000 // 1 hour = 3600 seconds = 3 600 000 milliseconds, 900 000 = 15 min
        );
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    render() {
        calender = this.state.calender;

        return (
            <div className="calender-container">

                {calender.length == 0 ? <h2>No Calender set up!</h2>
                :
                    <div>
                        <h2>Calender for today:</h2>
                        <ul id={'calender-list'}>
                            {
                                calender.map(item => <li className={'calender-item'}>{item.description} on {item.time}</li>)
                            }
                        </ul>
                    </div>
                }


            </div>
        );
    }
}

export default CalenderWidget;
