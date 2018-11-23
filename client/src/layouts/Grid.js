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
            widget_ids: props.widget_ids,
            widgets: []
        };
        this.resolveWidgetIds(props.widget_ids);
    }

    componentWillReceiveProps(props, content) {
        this.setState({
            widget_ids: props.widget_ids
        });
        this.resolveWidgetIds(props.widget_ids);
    }

    resolveWidgetIds(widget_ids) {
        let widgets = [];
        widget_ids.forEach(function (widget_id) {
            switch (widget_id) {
                case 0:
                    widgets.push(<ClockWidget style={{color: 'white'}}/>);
                    break;
                case 1:
                    widgets.push(<NewsFeed/>);
                    break;
                case 2:
                    widgets.push(<QuotesWidget/>);
                    break;
                case 3:
                    widgets.push(<ToDoWidget/>);
                    break;
                case 4:
                    widgets.push(<WeatherWidget/>);
                    break;
                default:
                    break;
            }
        });

        this.setState({
            widgets: widgets
        })
    }

    render() {
        return (
            <div className="container">

                <div className="upper-row">
                    <div id="widget">
                        {this.state.widgets[0]}
                    </div>
                    <div id="widget">
                        {this.state.widgets[1]}
                    </div>
                    <div id="widget">
                        {this.state.widgets[2]}
                    </div>
                    <div id="widget">
                        {this.state.widgets[3]}
                    </div>
                </div>

                <div className="lower-row">
                    <div id="widget">
                        {this.state.widgets[4]}
                    </div>
                    <div id="widget">
                        {this.state.widgets[5]}
                    </div>
                    <div id="widget">
                        {this.state.widgets[6]}
                    </div>
                    <div id="widget">
                        {this.state.widgets[7]}
                    </div>
                </div>

            </div>

        );
    }
}

export default Grid;
