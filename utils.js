const responseMessages = require('./responseMessages');

// for jsonwebtoken and session, verifies session token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.json({
            message: responseMessages.USER_NOT_AUTHORIZED
        });
    }
}

module.exports = {
    verifyToken
}