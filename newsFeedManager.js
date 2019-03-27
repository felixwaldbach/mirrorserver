let RssFeedEmitter = require('rss-feed-emitter');
const usersCollectionUtils = require("./database/usersCollectionUtils");

var newsFeed = {
    emitter: null,
    userId: null
};

async function setNewsFeedEmitter(userId, io) {
    newsFeed.userId = userId;

    let feeder = new RssFeedEmitter();

    let response = await usersCollectionUtils.getUserData(userId);
    if (JSON.parse(response).user_data.newsFeedItems.length > 0) JSON.parse(response).user_data.newsFeedItems.forEach(function (newsFeedItem) {
        feeder.add({
            url: newsFeedItem.url,
            refresh: 2000
        });

        feeder.on('new-item', function (item) {
            io.emit('web_news_feed_update', {
                news: JSON.stringify(item.title, null, 2),
                userId: userId
            });
        });
    });
}

function destroyNewsFeedEmitter() {
    newsFeed = {
        emitter: null,
        userId: null
    };
}

module.exports = {
    setNewsFeedEmitter,
    destroyNewsFeedEmitter
}