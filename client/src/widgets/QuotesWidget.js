import React, {Component} from 'react';
import {socket} from '../frontendConfig';

class QuotesWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            quote: ""
        }
    }

    componentDidMount() {
        socket.emit('send_quotes', {
            message: "send me quotes please!"
        });

        socket.on('new_quotes', function (data) {
            addQuotesToUI(data);
        });

        this.intervalID = setInterval(() => {
                socket.emit('send_quotes', {
                    message: "send me quotes please!"
                })
            },
            3600000 // 1 hour = 3600 seconds = 3600000 milliseconds
        );

        const addQuotesToUI = data => {
            if (data) {
                console.log(data);
                this.setState({quote: data});
            }
        };
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    render() {
        return (
            <div className="quotes-container">
                <h3>{this.state.quote.content} - {this.state.quote.title}</h3>
            </div>
        );
    }
}

export default QuotesWidget;
