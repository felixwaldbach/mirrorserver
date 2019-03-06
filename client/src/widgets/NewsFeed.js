import React, {Component} from 'react';

class NewsFeed extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className="news-container">
              <span id="news-title">Current News:</span>
              <li>Barcaaaaa</li>
              <li>Lets go..</li>
              <li>Morgen 23 Grad</li>
              <li>Nice</li>
            </div>
        );
    }
}

export default NewsFeed;
