var express = require('express');
var router = express.Router();
const userWidgetsCollectionUtils = require('../database/userWidgetsCollectionUtils');
const responseMessages = require("../responseMessages");
const os = require('os');
const config = require('../client/src/config');
const utils = require('../utils');

router.get('/hello', async (req, res) => {
    res.send({
        message: responseMessages.HELLO_EXPRESS
    });
});

router.get('/user/getUserWidgets', async (req, res) => {
    let response = await userWidgetsCollectionUtils.processGetUserWidgets(req.query.user_id);
    res.send(response);
});

// Login, check if credentials are correct and send back access_token
router.post('/user/setUserWidgets', async (req, res) => {
    let response = await userWidgetsCollectionUtils.setUserWidgets(req.body);
    res.send(response);
});

router.get('/camera/storetrain', async (req, res) => {
    let response;
    for (let i = 1; i <= config.TRAIN_IMAGE_NUMBER; i++) {
        response = await utils.initializeWebcam(req.query.user_id, os.platform());
        response = await utils.takeImage(response.Webcam, os.platform(), i, req.query.mirror_uuid, req.query.user_id);
        response = utils.sendImageToServer(response.base64, response.name, req.query.mirror_uuid, req.query.user_id);
    }
    if (response.last_image) {
        if (response.error) {
            res.send(JSON.stringify({
                status: false,
                message: responseMessages.FACE_TRAIN_ERROR
            }));
        }
        res.send(JSON.stringify(response));
    }
});

module.exports = router;
