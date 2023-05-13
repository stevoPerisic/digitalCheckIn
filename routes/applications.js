/**
 * Created by stevoperisic on 11/19/18.
 *
 * Application authentication routes
 * Used to create and check jwt tokens for application API access
 *
 * - CORS support -> https://www.html5rocks.com/en/tutorials/cors/#toc-adding-cors-support-to-the-server
 */

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var allowedHosts = require('./../bin/allowedHosts');
const HttpStatus = require('http-status-codes');

module.exports = function (passport) {

    router.use(function (req, res, next) {
        if(req.headers.origin && allowedHosts[req.headers.origin]){
            console.log('Yay we have an allowed host');
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        }

        res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, cache-control');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.status(HttpStatus.OK).send('Ok');
        }
        else {
            next();
        }
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
                console.log('Passport error: %s', err);
                next(err);
            } else if (!user) {
                console.log('No user - Info message: %s', info);
                res.send({"status": info.message});
            } else {
                // console.log('Passport user: %s', user);
                res.send({"status": user});
            }
        })(req, res, next);
    });

    return router;
};
