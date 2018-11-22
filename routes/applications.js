/**
 * Created by stevoperisic on 11/19/18.
 *
 * Application authentication routes
 * Used to create and check jwt tokens for application API access
 */

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

module.exports = function (passport) {

    router.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', 'http://localhost:8888, http://perisicdesigns.com');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, cache-control');

        next();
    });

    router.post('/gentoken', function (req, res) {
        var token = jwt.sign({user: {id: 1, username: req.query.appId, password: process.env.APP_PASS1}},
            process.env.PASSPORT_JWT_SECRET,
            { algorithm: 'HS256', expiresIn: '5h'});

        res.send({"token": token});
    });


    router.post('/auth', function (req, res, next) {
        passport.authenticate('jwt', {session: false}, function (err, user, info) {
            if (err) {
                next(err);
            } else if (!user) {
                res.send({"status": info.message});
            } else {
                res.send({"status": user});
            }
        })(req, res, next);
    });

    return router;
};
