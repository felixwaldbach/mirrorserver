import React, {Component} from 'react';

import Grid from "./layouts/Grid";
import ClockWidget from "./widgets/ClockWidget";
import NewsFeed from "./widgets/NewsFeed";
import WeatherWidget from "./widgets/WeatherWidget";
import QuotesWidget from "./widgets/QuotesWidget";
import ToDoWidget from "./widgets/ToDoWidget";

import socketIOClient from "socket.io-client";
import frontendConfig from './frontendConfig';

class App extends Component {

    state = {
        response: '',
        horizontal: true,
        widget_ids: [],
        endpoint: frontendConfig.server_address + ':' + frontendConfig.socket_server_port
    };

    componentDidMount() {
        this.callApi()
            .then(res => this.setState({response: res.express}))
            .catch(err => console.log(err));
        this.getUserWidgetIds()
            .then(res => this.setState({widget_ids: res.data}))
            .catch(err => console.log(err));
        const socket = socketIOClient(this.state.endpoint);
        socket.emit('message', {
            message: 'Hello World'
        });
        const app = this;
        socket.on('web_drop_event', function (data) {
            app.setUserWidgetIds(data)
                .then(res => app.getUserWidgetIds())
                .then(res => {
                    console.log(res.data);
                    app.setState({widget_ids: res.data})
                })
                .catch(err => console.log(err));
        })
    }

    callApi = async () => {
        const response = await fetch('/api/hello');
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    getUserWidgetIds = async () => {
        console.log('getting user widgets id');
        const response = await fetch('/api/user/getUserWidgetIds?user_id=felix');
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    setUserWidgetIds = async (data) => {
        console.log("setting user widget ids")
        const response = await fetch('/api/user/setUserWidgetIds', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "user_id": 'felix',
                "widget_id": data.widget_id,
                "slot": data.slot,
                "previous_slot": data.previous_slot
            })
        });
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    render() {
        return (
            <div>
                {this.state.horizontal ?
                    <Grid widget_ids={this.state.widget_ids}/>
                    : null
                }
            </div>
        );
    }
}

export default App;
