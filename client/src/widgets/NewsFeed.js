import React, {Component} from 'react';
import {socket} from '../socketConnection';


class NewsFeed extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userId: props.userId,
            newsFeedItems: [],
        }
    }

    componentDidMount() {
        socket.emit('web_set_newsFeedEmitter', {
            userId: this.state.userId
        });
        let app = this;
        socket.on('web_news_feed_update', function (data) {
            console.log(data)
            if (data.userId === app.state.userId) {
                let handleNewsFeedItems = app.state.newsFeedItems;
                if (handleNewsFeedItems.length > 4) {
                    handleNewsFeedItems.pop();
                }
                handleNewsFeedItems.unshift(data.news);
                app.setState({
                    newsFeedItems: handleNewsFeedItems
                });
            }
        });
    }

    componentWillUnmount() {
        socket.emit('web_destroy_newsFeedEmitter', {});
    }

    render() {
        return (
            <div id={this.state.containerId}
                 className={'news-feed-container'}
            >
                <ul id={'news-feed-list'}>
                    {
                        this.state.newsFeedItems.map(item => <li className={'news-feed-item'}>{item}</li>)
                    }
                </ul>
            </div>
        );
    }
}

export default NewsFeed;
