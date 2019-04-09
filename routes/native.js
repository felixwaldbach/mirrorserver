/**
 * Route handlers for all incoming requests on routes starting with /native/
 * Incoming requests are sent from the MirrorApp
 */

var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');

var fs = require('fs');
var fileName = '../config.json';
var file = require(fileName);

// Database utility functions Imports
const usersCollectionUtils = require('../database/usersCollectionUtils');
const widgetsCollectionUtils = require('../database/widgetsCollectionUtils');
const wunderlistCollectionUtils = require('../database/wunderlistCollectionUtils');
const weatherCollectionUtils = require('../database/weatherCollectionUtils');
const calendarCollectionUtils = require('../database/calendarCollectionUtils');

const responseMessages = require('../responseMessages'); // Predefined response messages to send with responses
var verifyToken = require('../utils').verifyToken; // Utility function to verify the token sent together with requests for identity verification

/**
 * Route: /authizeToken
 * Parameters: -
 * Function: Checks if the provided web token is valid
 */
router.post('/authizeToken', verifyToken, (req, res) => {
    jwt.verify(req.token, process.env.secretkey, (err, authData) => { // Checks if provided token is valid
        if (err) { // If token is invalid, send error message back
            res.send(JSON.stringify({
                authorized: false,
                message: responseMessages.TOKEN_ERROR
            }));
        } else {  // If token is valid, send success message back
            res.send(JSON.stringify({
                authorized: true,
                message: responseMessages.TOKEN_SUCCESS
            }));
        }
    });
});

/**
 * Route: /signup
 * Parameters: username: username to register, passsword: password to save with username
 * Function: Executes Register Function to insert a new document into the users collection
 */
router.post('/signup', async (req, res) => {
    let response = await usersCollectionUtils.registerUser(req.body.username, req.body.password);
    res.send(response);
});

/**
 * Route: /signin
 * Parameters: username: username to log in, password: password to check with username
 * Function: Executes Login Function to check credentials and log user in, sending a token if successful
 */
router.post('/signin', async (req, res) => {
    let response = await usersCollectionUtils.signInUser(req.body.username, req.body.password);
    res.send(response);
});

/**
 * Route: /getUserData
 * Parameters: -
 * Function: Gets Data from a user depending on the provided web token
 */
router.get('/getUserData', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => { // check if provided token is valid
        if (err) { // If token is invalid, send error message back
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else { // If token is valid, get user data from database with user id from the token
            const userId = authData.userId;
            let response = await usersCollectionUtils.getUserData(userId);
            res.send(response);
        }
    });
});

/**
 * Route: /getWidgets
 * Parameters: -
 * Function: Gets All Widgets available in the widgets collection
 */
router.get('/getWidgets', verifyToken, async (req, res) => {
    let response = await widgetsCollectionUtils.getWidgets(); // Call function to get all documents from widgets collection
    res.send(response);
});


/**
 * Route: /updateUserWidgets
 * Parameters: widgetName: Name of the widget to update, previousSlot: Slot the widget was placed in , slot: Slot the widget is moved to
 * Function: Updates the users widget arrangement, moving a widget from previousSlot to slot position
 */
router.post('/updateUserWidgets', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => { // Check if token is valid
        if (err) { // If token is invalid, send error message back
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else { // If token is valid, call function to update user document inside users collection with new wiget arrangement
            const userId = authData.userId;
            let response = await usersCollectionUtils.updateUserWidgets(userId, req.body.widgetName, req.body.previousSlot, req.body.slot);
            res.send(response);
        }
    });

});


router.post('/uploadWunderlistSettings', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else {
            const userId = authData.userId;
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
            const userId = authData.userId;
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
            const userId = authData.userId;
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
            const userId = authData.userId;
            let response = await weatherCollectionUtils.getWeatherSettings(userId);
            res.send(response);
        }
    });
});

// Upload Calender Settings and clientid
router.post('/uploadCalendarSettings', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else {
            const userId = authData.userId;
            let response = await calendarCollectionUtils.uploadCalendarSettings(req.body, userId);
            res.send(response);
        }
    });
});

// Getting Calender Settings and clientid
router.get('/getCalenderSettings', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else {
            const userId = authData.userId;
            let response = await calendarCollectionUtils.getCalenderSettings(userId);
            res.send(response);
        }
    });
});

// Setup Django IP address over Smartphone
router.post('/uploadDjangoIP', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
        if (err) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.USER_NOT_AUTHORIZED
            }));
        } else {
            // read ip adress and update config.json
            file.django_address = "http://" + req.body.djangoIP;

            fs.writeFile("./config.json", JSON.stringify(file), function (err) {
              if (err) return console.log(err);
              console.log(JSON.stringify(file));
              console.log('writing to ' + "./config.json");
            });

            res.send(JSON.stringify({
                status: true,
                message: responseMessages.DJANGO_UPDATE_SUCCESS
            }));

        }
    });
});

module.exports = router;
