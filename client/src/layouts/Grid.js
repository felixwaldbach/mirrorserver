import React, {Component} from 'react';
import '../font/css/grid.css';

class Grid extends Component {

    constructor(props) {
        super(props);
        this.state = {
            widgets: props.widgets,
        }
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
