var express = require('express');
var router = express.Router();

module.exports = function (passport) {

    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    /**
     * @todo Implement log-out
     **/

    return router;
};