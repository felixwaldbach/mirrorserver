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
import {getUserWidgets, getCameraPicture, getStoreTrainDataset} from "./api/get";
import {setUserWidgets} from "./api/post";

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

        const addCookies = data => {
            if (data) {
                if (data.motion == "1") {
                    // set cookie & get widget allignment for this user
                    bake_cookie("token", data.user_id);
                    this.setState({
                        redirectToQRCode: false
                    })
                } else if (data.motion == "0") {
                    // delete cookie & redirect to qr-code
                    delete_cookie('token');
                }
            }
        };

        // send user_id from cookies to backend to get userwidgets for that user_id via read_cookie('token')
        let response = await getUserWidgets('Emre');
        this.setState({
            widgets: response.data
        });
        this.resolveWidgets(this.state.widgets);
        const app = this;
        socket.on('web_drop_event', async function (data) {
            await setUserWidgets(data);
            response = await getUserWidgets();
            app.setState({
                widgets: response.data
            });
            app.resolveWidgets(app.state.widgets);
        });
    }

    resolveWidgets(widgets) {
        let htmlElements = [];
        widgets.forEach(function (widget) {
            if (widget) {
                switch (widget.widget_id) {
                    case 0:
                        htmlElements.push(<ClockWidget style={{color: 'white'}}/>);
                        break;
                    case 1:
                        htmlElements.push(<NewsFeed/>);
                        break;
                    case 2:
                        htmlElements.push(<QuotesWidget/>);
                        break;
                    case 3:
                        htmlElements.push(<ToDoWidget/>);
                        break;
                    case 4:
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
