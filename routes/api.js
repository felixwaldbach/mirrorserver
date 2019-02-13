var express = require('express');
var router = express.Router();
const userWidgetsCollectionUtils = require('../database/userWidgetsCollectionUtils');
const responseMessages = require("../responseMessages");

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

module.exports = router;
