/**
 * Route handlers for all incoming requests on routes starting with /api/
 * Incoming requests are sent from the Frontend
 */

var express = require('express');
var router = express.Router();

// Database utility functions Imports
const usersCollectionUtils = require('../database/usersCollectionUtils');

/**
 * Route: /user/getUserData
 * Parameters: userId: user id to get the data from
 * Function: Executes get user data function to get user data from a document inside the users collection with matching _id
 */
router.get('/user/getUserData', async (req, res) => {
    let response = await usersCollectionUtils.getUserData(req.query.userId); // Execute function to get user data from the users collection
    res.send(response);
});

module.exports = router;
