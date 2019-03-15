var express = require('express');
var router = express.Router();
const usersCollectionUtils = require('../database/usersCollectionUtils');
const widgetsCollectionUtils = require('../database/widgetsCollectionUtils');
const responseMessages = require("../responseMessages");

router.get('/hello', async (req, res) => {
    res.send({
        message: responseMessages.HELLO_EXPRESS
    });
});

router.get('/user/getUserData', async (req, res) => {
    let response = await usersCollectionUtils.getUserData(req.query.user_id);
    res.send(response);
});

module.exports = router;
