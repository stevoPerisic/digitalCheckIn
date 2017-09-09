var express = require('express');
var router = express.Router();

module.exports = function (passport) {

    /**
     * @description user/login route
     * - POST to login the user via the local-login Passport Local Strategy
     **/
    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    /**
     * @description user/logout
     * - using the req.logout
     **/
    router.get('/logout', function (req, res, next) {
       req.logout();
       res.redirect('/');
    });

    return router;
};