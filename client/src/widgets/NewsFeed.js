import React, {Component} from 'react';
import {socket} from '../socketConnection';
import {
    Link,
    Element,
    Events,
    animateScroll as scroll
} from 'react-scroll'

class NewsFeed extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userId: props.userId,
            newsFeedItems: [],
            scrollToBottom: true,
            durationTime: 1000,
            containerId: 'news-feed-container'
        }
    }

    componentDidMount() {
        socket.emit('web_set_newsFeedEmitter', {
            userId: this.state.userId
        });

        let app = this;
        socket.on('web_news_feed_update', function (data) {
            if (data.userId === app.state.userId) {
                let handleNewsFeedItems = app.state.newsFeedItems;
                if (handleNewsFeedItems.length >= 60) {
                    handleNewsFeedItems.splice(0, 1);
                }
                handleNewsFeedItems.push(data.news);
                app.setState({
                    newsFeedItems: handleNewsFeedItems
                })
            }
        });

        scroll.scrollTo(1);
        Events.scrollEvent.register('end', function (to, element) {
            console.log('end')
            console.log(app.state.scrollToBottom)
            if (app.state.scrollToBottom) {
                console.log('Scroll to Bottom')
                scroll.scrollToBottom({
                    duration: app.state.durationTime * app.state.newsFeedItems.length,
                    containerId: app.state.containerId
                });
                app.setState({
                    scrollToBottom: false
                })
            } else {
                console.log('Scroll to Top')
                scroll.scrollToTop({
                    duration: app.state.durationTime * app.state.newsFeedItems.length,
                    containerId: app.state.containerId
                });
                app.setState({
                    scrollToBottom: true
                })
            }
        });
    }

    componentWillUnmount() {
        socket.emit('web_destroy_newsFeedEmitter', {});
    }

    render() {
        return (
            <div id={'news-feed-container'}>
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
