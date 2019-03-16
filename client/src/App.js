import React, {Component} from 'react';
import './font/css/grid.css';
import ClockWidget from "./widgets/ClockWidget";
import NewsFeed from "./widgets/NewsFeed";
import QuotesWidget from "./widgets/QuotesWidget";
import ToDoWidget from "./widgets/ToDoWidget";
import WeatherWidget from "./widgets/WeatherWidget";
import QRCode from "./QRCode";
import {bake_cookie, delete_cookie} from 'sfcookies';

import {socket} from './socketConnection';
import {getUserData} from "./api/get";

class App extends Component {

    state = {
        htmlElements: [],
        redirectToQRCode: true,
        message: 'test',
        user_id: ''
    };

    async componentDidMount() {
        const app = this;
        socket.on('handle_session', function (data) {
            if (data.user_id) {
                app.addCookies(data);
            }
        });

        socket.on('web_trigger_face_id', function (data) {
            app.setState({
                message: data.message
            })
        });

        socket.on('web_update_widgets', async function (data) {
            if (data.user_id === app.state.user_id) {
                let response = await getUserData(app.state.user_id);
                app.setState({
                    widgets: response.user_data.widgets
                });
                app.renderWidgets();
            }
        });
    }

    async addCookies(data) {
        if (data) {
            if (data.motion === "1") {
                // set cookie & get widget allignment for this user
                bake_cookie("token", data.token);
                this.setState({
                    user_id: data.user_id,
                    redirectToQRCode: false
                });
                this.renderWidgets();
            } else if (data.motion === "0") {
                this.setState({
                    user_id: null,
                    htmlElements: [],
                    redirectToQRCode: true
                });
                delete_cookie('token');
            }
        }
    }

    async renderWidgets() {
        let response = await getUserData(this.state.user_id);

        let htmlElements = [];
        response.user_data.widgets.forEach(function (widget) {
            if (widget) {
                switch (widget.name) {
                    case "ClockWidget":
                        htmlElements.push(<ClockWidget style={{color: 'white'}}/>);
                        break;
                    case "NewsFeed":
                        htmlElements.push(<NewsFeed/>);
                        break;
                    case "QuotesWidget":
                        htmlElements.push(<QuotesWidget/>);
                        break;
                    case "ToDoWidget":
                        htmlElements.push(<ToDoWidget/>);
                        break;
                    case "WeatherWidget":
                        htmlElements.push(<WeatherWidget/>);
                        break;
                    default:
                        htmlElements.push(null);
                        break;
                }
            } else {
                htmlElements.push(<div/>);
            }
        });
        this.setState({
            htmlElements: htmlElements
        })
    }

    render() {
        return (
            this.state.redirectToQRCode ?
                <QRCode/> :
                <div className="container">
                    <div className="upper-row">
                        <div id="widget">
                            {this.state.htmlElements[0]}
                        </div>
                        <div id="widget">
                            {this.state.htmlElements[1]}
                        </div>
                        <div id="widget">
                            {this.state.htmlElements[2]}
                        </div>
                        <div id="widget">
                            {this.state.htmlElements[3]}
                        </div>
                    </div>
                    <p>{this.state.message}</p>
                    <div className="lower-row">
                        <div id="widget">
                            {this.state.htmlElements[4]}
                        </div>
                        <div id="widget">
                            {this.state.htmlElements[5]}
                        </div>
                        <div id="widget">
                            {this.state.htmlElements[6]}
                        </div>
                        <div id="widget">
                            {this.state.htmlElements[7]}
                        </div>
                    </div>
                </div>
        );
    }
}

export default App;
