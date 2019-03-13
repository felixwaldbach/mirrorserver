var express = require('express');
var router = express.Router();
const usersCollectionUtils = require('../database/usersCollectionUtils');
const widgetsCollectionUtils = require('../database/widgetsCollectionUtils');
const wunderlistCollectionUtils = require('../database/wunderlistCollectionUtils');
const weatherCollectionUtils = require('../database/weatherCollectionUtils');
const jwt = require('jsonwebtoken');
const responseMessages = require('../responseMessages');
var verifyToken = require('../utils').verifyToken;

// HTTP Requests
// check if token is authorized
router.post('/authizeToken', verifyToken, (req, res) => {
    jwt.verify(req.token, process.env.secretkey, (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                authorized: false,
                message: responseMessages.TOKEN_ERROR
            }));
        } else {
            res.send(JSON.stringify({
                authorized: true,
                message: responseMessages.TOKEN_SUCCESS
            }));
        }
    });
});

// Register, check user credentials and create user with jwt
router.post('/signup', async (req, res) => {
    let response = await usersCollectionUtils.registerUser(req.body.username, req.body.password);
    res.send(response);
});

// Login, check if credentials are correct and send back access_token
router.post('/signin', async (req, res) => {
    let response = await usersCollectionUtils.signInUser(req.body.username, req.body.password);
    res.send(response);
});

// Get user data
router.get('/getUserData', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else {
            const userId = authData.user_id;
            let response = await usersCollectionUtils.getUserData(userId);
            res.send(response);
        }
    });
});

// Get user data
router.get('/getWidgets', verifyToken, async (req, res) => {
    let response = await widgetsCollectionUtils.getWidgets();
    res.send(response);
});


// Login, check if credentials are correct and send back access_token
router.post('/updateUserWidgets', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else {
            const userId = authData.user_id;
            let response = await usersCollectionUtils.updateUserWidgets(userId, req.body.widget_name, req.body.previous_slot, req.body.slot);
            res.send(response);
        }
    });

});

// Upload Wunderlist Settings and clientid
router.post('/uploadWunderlistSettings', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else {
            const userId = authData.user_id;
            let response = await wunderlistCollectionUtils.uploadWunderlistSettings(req.body, userId);
            res.send(response);
        }
    });
});

// Getting Wunderlist Settings and clientid
router.post('/getWunderlistSettings', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else {
            const userId = authData.user_id;
            let response = await wunderlistCollectionUtils.getWunderlistSettings(userId);
            res.send(response);
        }
    });
});

// Upload Weather Settings and clientid
router.post('/uploadWeatherSettings', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else {
            const userId = authData.user_id;
            let response = await weatherCollectionUtils.uploadWeatherSettings(req.body, userId);
            res.send(response);
        }
    });
});

// Getting Weather API Settings and clientid
router.get('/getWeatherSettings', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else {
            const userId = authData.user_id;
            let response = await weatherCollectionUtils.getWeatherSettings(userId);
            res.send(response);
        }
    });
});

module.exports = router;
