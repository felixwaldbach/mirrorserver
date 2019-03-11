import React, {Component} from 'react';
import './font/css/grid.css';
import ClockWidget from "./widgets/ClockWidget";
import NewsFeed from "./widgets/NewsFeed";
import QuotesWidget from "./widgets/QuotesWidget";
import ToDoWidget from "./widgets/ToDoWidget";
import WeatherWidget from "./widgets/WeatherWidget";
import QRCode from "./QRCode";
import {bake_cookie, delete_cookie} from 'sfcookies';

import {socket} from './frontendConfig';
import {getUserData} from "./api/get";

class App extends Component {

    state = {
        horizontal: true,
        widgets: [],
        htmlElements: [],
        redirectToQRCode: true
    };

    async componentDidMount() {
        socket.on('handle_session', function (data) {
            addCookies(data);
        });

        socket.on('web_trigger_face_id', function (data) {
            console.log(data);
        });

        const addCookies = async (data) => {
            if (data) {
                if (data.motion === "1") {
                    // set cookie & get widget allignment for this user
                    bake_cookie("token", data.token);
                    let response = await getUserData(data.user_id);
                    this.setState({
                        user_id: data.user_data.user_id,
                        widgets: response.user_data.widgets,
                        redirectToQRCode: false
                    });
                    this.resolveWidgets(this.state.widgets);
                } else if (data.motion === "0") {
                    this.setState({
                        redirectToQRCode: true
                    });
                    delete_cookie('token');
                }
            }
        };

        const app = this;
        socket.on('web_drop_event', async function (data) {
            if (data.user_id === this.state.user_id) {
                let response = await getUserData(this.state.user_id);
                app.setState({
                    widgets: response.data.widgets
                });
                app.resolveWidgets(app.state.widgets);
            }
        });
    }

    async resolveWidgets(widgets) {
        let htmlElements = [];
        widgets.forEach(function (widget) {
            if (widget) {
                switch (widget.widget_name) {
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
