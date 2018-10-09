import React, {Component} from 'react';
import './App.css';

import Horizontal from "./layouts/Horizontal";
import Vertical from "./layouts/Vertical";
import ClockWidget from "./widgets/ClockWidget";
import NewsFeed from "./widgets/NewsFeed";

class App extends Component {

    state = {
        response: '',
        horizontal: true,
        widgets: []
    };

    componentDidMount() {
        this.callApi()
            .then(res => this.setState({response: res.express}))
            .catch(err => console.log(err));
    }

    callApi = async () => {
        const response = await fetch('/api/hello');
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    render() {

        this.state.widgets = [];
        this.state.widgets.push(<ClockWidget style={{color: 'blue', fontFamily: 'italic'}}/>);
        this.state.widgets.push(<NewsFeed />);

        return (
            <div>
                {this.state.horizontal ? <Horizontal widgets={this.state.widgets} />: <Vertical widgets={this.state.widgets}/>}
            </div>
        );
    }
}

export default App;