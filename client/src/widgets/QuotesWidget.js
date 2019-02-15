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
                // delete html tags: object to string. delete. string back to object
                let quoteAsString = JSON.stringify(data);
                quoteAsString = quoteAsString.replace(/<\/?[^>]+(>|$)/g, "");
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
