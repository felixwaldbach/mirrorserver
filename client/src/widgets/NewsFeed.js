import React, {Component} from 'react';

class NewsFeed extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className="news-container">
              <span id="news-title">Schlagzeilen:</span>
              <li id="news-items">Retro Classics in Stuttgart</li>
              <li id="news-items">In der ZDF-Erfolgsserie Ferdinand Seebacher wird der neue Bergretter</li>
              <li id="news-items">EU-Kommission besorgt über hohe Flüchtligszahl in Spanien</li>
              <li id="news-items">Unfall auf der A 81 bei Asperg</li>
              <li id="news-items">Porsche sucht Hunderte Arbeiter</li>
            </div>
        );
    }
}

export default NewsFeed;
