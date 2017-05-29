/**
 * Created by stevoperisic on 5/1/17.
 *
 * patient registration controller
 */
var request = require('request');
// UNCOMMENT TO SET DEBUGGING ON REQUESTS
// request.debug = true;
var express = require('express');
var router = express.Router();

var querystring = require('querystring');

// ATHENA API SPECIFIC
var version = 'preview1';
var practiceid = 195900;
var auth_prefixes = {
    v1: '/oauth',
    preview1: '/oauthpreview',
    openpreview1: '/oauthopenpreview'
};
var token; // to store the token that we get via authentication


// This is a useful function to have
function path_join() {
    // trim slashes from arguments, prefix a slash to the beginning of each, re-join (ignores empty parameters)
    var args = Array.prototype.slice.call(arguments, 0);
    var nonempty = args.filter(function (arg, idx, arr) {
        return typeof(arg) != 'undefined';
    });
    var trimmed = nonempty.map(function (arg, idx, arr) {
        var str = String(arg).replace(new RegExp('^/+|/+$'), '');

        if(str.indexOf('?') < 0){
            str = '/' + str;
        }
        return str;
    });

    return trimmed.join('');
}

/* GET home page. */
router.get('/', function (req, res, next) {

    // Stop running the Athena APIs for now
    // athenaNaive();

    res.render('patientRegistration', {title: 'Patient registration'});
});

router.get('/:patientId',
    function (req, res, next) {

        // we need to authenticate with Athena first
        // this maybe needs to be done on log-in
        // for now we will do it here
        var authOptions =  {
            baseUrl: 'https://api.athenahealth.com',
            method: 'POST',
            uri: path_join(auth_prefixes[version], '/token'),
            auth: {
                user: process.env.ATHENA_KEY,
                pass: process.env.ATHENA_SECRET
            },
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            json: true,
            body: querystring.stringify({grant_type: 'client_credentials'})
        };

        request(authOptions, function (error, response, body) {
            // body is the decompressed response body
            if(error)
                console.log(error);

            console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
            console.log('the decoded data is: ' + JSON.stringify(body));

            // var authorization = JSON.parse(body);
            // once we have a positive response like so:
            // {"access_token":"zd34cmqdbhnpxfd896wxzcbp","token_type":"bearer","expires_in":3600,"refresh_token":"fe7umf2b5pv8h2genzrfja6q"}
            //
            // we will store it in a session that expires in 3600 so that we will need to re-auth the next time
            // for now we will store this in a global
            token = body.access_token;

            console.log(token);

            next();
        });

    },
    function(req, res, next){
        var patientOptions = {
            baseUrl: 'https://api.athenahealth.com',
            method: 'GET',
            uri: path_join(version, practiceid, '/patients', req.params.patientId),
            auth: {
                'bearer': token
            },
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            json: true
        };
        request(patientOptions, function (error, response, body) {
            if(error){
                console.log(error);
                res.status(500).send(error);
            }

            // redirect to demographics route
            // req.app.locals.checkinData = body;
            // res.send(body);
            res.render('patientRegistration', {title: 'Patient registration', patient: body[0]});
        });
    }
);

module.exports = router;
