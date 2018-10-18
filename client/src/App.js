import React, {Component} from 'react';

import Grid from "./layouts/Grid";
import ClockWidget from "./widgets/ClockWidget";
import NewsFeed from "./widgets/NewsFeed";
import WeatherWidget from "./widgets/WeatherWidget";
import QuotesWidget from "./widgets/QuotesWidget";

import socketIOClient from "socket.io-client";
import frontendConfig from './frontendConfig';

class App extends Component {

    state = {
        response: '',
        horizontal: true,
        widgets: [],
        endpoint: frontendConfig.server_address + ':' + frontendConfig.socket_server_port
    };

    componentDidMount() {
        this.callApi()
            .then(res => this.setState({response: res.express}))
            .catch(err => console.log(err));
        const socket = socketIOClient(this.state.endpoint);
        socket.emit('message', {
            message: 'Hello World'
        });
    }

    callApi = async () => {
        const response = await fetch('/api/hello');
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    render() {

        // Reihenfolge der pushes bzw. Stelle wo es uebersprungen ist, wird in der App festgelegt
        this.state.widgets = [];
        this.state.widgets.push(<ClockWidget style={{color: 'white'}}/>);
        this.state.widgets.push(<NewsFeed />);
        this.state.widgets.push(<WeatherWidget />);
        this.state.widgets.push(<QuotesWidget />);

        return (
            <div>
                {this.state.horizontal ?
                  <Grid widgets={this.state.widgets} />
                  : null
                }
            </div>
        );
    }
}

export default App;
