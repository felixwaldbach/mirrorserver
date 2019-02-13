import React, {Component} from 'react';

import Grid from "./layouts/Grid";

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
        this.getUserWidgets()
            .then(res => {
                this.setState({widgets: res.data})
            })
            .catch(err => console.log(err));
        const socket = socketIOClient(this.state.endpoint);
        socket.emit('message', {
            message: 'Hello World'
        });
        const app = this;
        socket.on('web_drop_event', function (data) {
            app.setUserWidgets(data)
                .then(res => app.getUserWidgets())
                .then(res => {
                    app.setState({widgets: res.data})
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

    getUserWidgets = async () => {
        const response = await fetch('/api/user/getUserWidgets?user_id=Emre');
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    setUserWidgets = async (data) => {
        const response = await fetch('/api/user/setUserWidgets', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "user_id": 'felix',
                "widget": {
                    widget_id: data.widget_id,
                    widget_name: data.widget_name,
                    remove: false
                },
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
                    <Grid widgets={this.state.widgets}/>
                    : null
                }
            </div>
        );
    }
}

export default App;
