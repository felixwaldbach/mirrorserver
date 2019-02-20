var express = require('express');
var router = express.Router();
const uuid = require('uuid/v4');
const multer = require('multer');
const allWidgetsCollectionUtils = require('../database/allWidgetsCollectionUtils');
const usersCollectionUtils = require('../database/usersCollectionUtils');
const userWidgetsCollectionUtils = require('../database/userWidgetsCollectionUtils');
const wunderlistCollectionUtils = require('../database/wunderlistCollectionUtils');
const weatherCollectionUtils = require('../database/weatherCollectionUtils');
const jwt = require('jsonwebtoken');
const responseMessages = require('../responseMessages');

//Setup Multer for uploading images
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: function (req, file, callback) {
        switch (file.mimetype) {
            case 'image/jpeg':
                ext = '.jpeg';
                break;
            case 'image/png':
                ext = '.png';
                break;
            default:
                ext = '';
        }
        callback(null, uuid() + ext);
    }
});
const upload = multer({storage: storage});
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
    let response = await usersCollectionUtils.registerUser(req.body);
    res.send(response);
});

// Login, check if credentials are correct and send back access_token
router.post('/signin', async (req, res) => {
    let response = await usersCollectionUtils.signInUser(req.body);
    res.send(response);
});

// Get user data
router.get('/getUserData', verifyToken, async (req, res) => {
    let response = await usersCollectionUtils.getUserDataForCurrentUser(req.token, process.env.secretkey);
    res.send(response);
});

// Get user data
router.get('/getAllWidgets', verifyToken, async (req, res) => {
    let response = await allWidgetsCollectionUtils.getAllWidgets();
    res.send(response);
});

// Get user data
router.get('/getUserWidgets', verifyToken, async (req, res) => {
    let response = await userWidgetsCollectionUtils.processGetUserWidgets(req.query.user_id);
    res.send(response);
});

// Uploading Image for Open CV
router.post('/uploadImage', verifyToken, upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.send(JSON.stringify({
            status: false,
            message: responseMessages.IMAGE_UPLOAD_ERROR
        }));
    } else {
        jwt.verify(req.token, process.env.secretkey, async (err, authData) => {
            if (err) {
                res.send(JSON.stringify({
                    status: false,
                    message: responseMessages.USER_NOT_AUTHORIZED
                }));
            } else {
                const fileData = req.file;
                const userId = authData.userid;
                let response = await usersCollectionUtils.uploadImageToServer(fileData, userId);
                res.send(response);
            }
        });
    }
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
            const userId = authData.userid;
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
            const userId = authData.userid;
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
            const userId = authData.userid;
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
            const userId = authData.userid;
            let response = await weatherCollectionUtils.getWeatherSettings(userId);
            res.send(response);
        }
    });
});

module.exports = router;
