import React, {Component} from 'react';
import '../font/css/grid.css';
import ClockWidget from "../widgets/ClockWidget";
import NewsFeed from "../widgets/NewsFeed";
import QuotesWidget from "../widgets/QuotesWidget";
import ToDoWidget from "../widgets/ToDoWidget";
import WeatherWidget from "../widgets/WeatherWidget";

class Grid extends Component {

    constructor(props) {
        super(props);
        this.state = {
            widgets: props.widgets,
            htmlElements: []
        };
        this.resolveWidgets(props.widgets);
    }

    componentWillReceiveProps(props, content) {
        this.setState({
            widgets: props.widgets
        });
        this.resolveWidgets(props.widgets);
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

export default Grid;
