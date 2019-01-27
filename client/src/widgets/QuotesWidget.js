import React, {Component} from 'react';
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
                // delete html tags: object to string. delete. string back to object
                let quoteAsString = JSON.stringify(data);
                quoteAsString = quoteAsString.replace(/<\/?[^>]+(>|$)/g, "");;
                let quote = JSON.parse(JSON.parse(quoteAsString).randomQuote)[0].content + " - " + JSON.parse(JSON.parse(quoteAsString).randomQuote)[0].title;
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
