import React, {Component} from 'react';
import './font/css/grid.css';
import ClockWidget from "./widgets/ClockWidget";
import NewsFeed from "./widgets/NewsFeed";
import QuotesWidget from "./widgets/QuotesWidget";
import ToDoWidget from "./widgets/ToDoWidget";
import WeatherWidget from "./widgets/WeatherWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import QRCode from "./QRCode";
import {bake_cookie, delete_cookie} from 'sfcookies';

import {socket} from './socketConnection';
import {getUserData} from "./api/get";

class App extends Component {

    state = {
        htmlElements: [],
        redirectToQRCode: true,
        message: '',
        displayMessage: false,
        userId: ''
    };

    async componentDidMount() {
        const app = this;
        socket.on('handle_session', function (data) {
            if (data.motion === "1") {
                // set cookie & get widget allignment for this user
                bake_cookie("token", data.token);
                app.setState({
                    userId: data.userId,
                    redirectToQRCode: false
                });
                app.renderWidgets();
            } else if (data.motion === "0") {
                app.setState({
                    userId: null,
                    htmlElements: [],
                    redirectToQRCode: true
                });
                delete_cookie('token');
            }
        });

        socket.on('wait_trigger_face_id', function (data) {
            app.setState({
                message: data.message,
                displayMessage: data.displayMessage
            })
        });

        socket.on('web_update_widgets', async function (data) {
            if (data.userId === app.state.userId) {
                let response = await getUserData(app.state.userId);
                app.setState({
                    widgets: response.user_data.widgets
                });
                app.renderWidgets();
            }
        });
    }

    async renderWidgets() {
        let app = this;
        let response = await getUserData(this.state.userId);

        let htmlElements = [];
        response.user_data.widgets.forEach(function (widget) {
            if (widget) {
                switch (widget.name) {
                    case "ClockWidget":
                        htmlElements.push(<ClockWidget style={{color: 'white'}}/>);
                        break;
                    case "NewsFeed":
                        htmlElements.push(<NewsFeed userId={app.state.userId}/>);
                        break;
                    case "QuotesWidget":
                        htmlElements.push(<QuotesWidget/>);
                        break;
                    case "ToDoWidget":
                        htmlElements.push(<ToDoWidget userId={app.state.userId}/>);
                        break;
                    case "WeatherWidget":
                        htmlElements.push(<WeatherWidget userId={app.state.userId}/>);
                        break;
                    case "CalendarWidget":
                        htmlElements.push(<CalendarWidget userId={app.state.userId}/>);
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
                    {this.state.displayMessage ? <p className={'faceIdMessage'}>{this.state.message}</p> : null}

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
