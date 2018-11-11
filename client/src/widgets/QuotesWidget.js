import React, {Component} from 'react';
import $ from 'jquery';
import socketIOClient from "socket.io-client";
import frontendConfig from '../frontendConfig';

class QuotesWidget extends Component {

    constructor(props) {
      super(props);
        this.state = {
            quote: "",
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
            if(data) {
                let quote = JSON.parse(data.randomQuote).quote + " - " + JSON.parse(data.randomQuote).author;
                this.setState({quote: quote});    
            }
        };
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    render() {
        return (
            <div className="quotes-container">
              <span>{this.state.quote}</span>
            </div>
        );
    }
}

export default QuotesWidget;
