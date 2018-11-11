import React, {Component} from 'react';
import $ from 'jquery';
import socketIOClient from "socket.io-client";
import frontendConfig from '../frontendConfig';

class QuotesWidget extends Component {

    constructor(props) {
      super(props);
        this.state = {
            quote: "",
            author: "",
            endpoint: frontendConfig.server_address + ':' + frontendConfig.socket_server_port
        }
    }

    componentDidMount() {
        // WebSockets
        this.socket = socketIOClient(this.state.endpoint);
        this.socket.emit('send_quotes', {
            message: "send me quotes please!"
        });

        this.socket.on('new_quotes', function (data) {
            addQuotesToUI(data);
        });

        this.intervalID = setInterval( () => {
            this.socket.emit('send_quotes', {
                message: "send me quotes please!"
            })},
            3600000 // 1 hour = 3600 seconds = 3600000 milliseconds
        );

        const addQuotesToUI = data => {
            this.setState({quote: JSON.parse(data.randomQuote).quote});
            this.setState({author: JSON.parse(data.randomQuote).author});
        };
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    render() {
        return (
            <div className="quotes-container">
              <span>{this.state.quote} - {this.state.author}</span>
            </div>
        );
    }
}

export default QuotesWidget;
