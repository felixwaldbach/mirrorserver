var express = require('express');
var router = express.Router();
const userWidgetsCollectionUtils = require('../database/userWidgetsCollectionUtils');

router.get('/hello', async (req, res) => {
    res.send({
        express: 'Hello From Express'
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
