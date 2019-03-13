var express = require('express');
var router = express.Router();
const usersCollectionUtils = require('../database/usersCollectionUtils');
const widgetsCollectionUtils = require('../database/widgetsCollectionUtils');
const responseMessages = require("../responseMessages");
const config = require('../client/src/config');
const utils = require('../utils');
var qr = require('qr-image');
var fs = require('fs');
const path = require('path');

router.get('/hello', async (req, res) => {
    res.send({
        message: responseMessages.HELLO_EXPRESS
    });
});

router.get('/qrcode', async (req, res) => {
    var qr_svg = qr.image(config.SERVER_ADDRESS + ':' + config.SOCKET_SERVER_PORT, {type: 'svg'});
    let jsonPath = path.join(__dirname, '..', 'client', 'src', 'savedQrCode', 'qrcode.svg');
    qr_svg.pipe(fs.createWriteStream(jsonPath));

    res.send(JSON.stringify({
        status: true,
        message: responseMessages.QRCODE_SUCCESS,
    }));
});

router.get('/user/getUserData', async (req, res) => {
    let response = await usersCollectionUtils.getUserData(req.query.user_id);
    res.send(response);
});


// Get user data
router.get('/getWidgets', async (req, res) => {
    let response = await widgetsCollectionUtils.getWidgets();
    res.send(response);
});

module.exports = router;
