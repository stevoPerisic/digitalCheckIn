/**
 * Created by stevoperisic on 5/8/17.
 *
 * Appointments route and controller
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
router.get('/',
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
        // let's fetch appointments
        console.log('Fetch appointments using the auth token: '+token);
        var parameters = {
            appointmentstatus: 'f',
            departmentid: 1,
            enddate: '04/29/2017',
            ignorerestrictions: 'false',
            showcancelled: 'false',
            showclaimdetail: 'false',
            showcopay: 'false',
            showexpectedprocedurecodes: 'false',
            showinsurance: 'false',
            showpatientdetail: 'true',
            showremindercalldetail: 'false',
            startdate: '04/21/2017'
        };
        var query = '?' + querystring.stringify(parameters);
        var apptsOptions = {
            baseUrl: 'https://api.athenahealth.com',
            method: 'GET',
            uri: path_join(version, practiceid, '/appointments/booked', query),
            auth: {
                'bearer': token
            },
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            json: true
        };

        request(apptsOptions, function (error, response, body) {
            if(error)
                console.log(error);

            // console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
            // console.log('the decoded data is: ' + JSON.stringify(body));

            res.render('appointments', {title: 'Today\'s appointments', appts: body.appointments});
        });


    }
);

router.get('/:id/checkIn', function (req, res, next) {
    // res.send('Start check-in for appointment ID: '+ JSON.stringify(req.params.id));

    console.log('Start check-in process by calling /preview1/:practiceid/appointments/:appointmentid/checkin');
    console.log('using token: '+token);

    // var parameters = {
    //     appointmentid: req.params.id
    // };
    // var query = '?' + querystring.stringify(parameters);
    console.log(path_join(version, practiceid, '/appointments/', req.params.id, '/checkin'));
    var checkInOptions = {
        baseUrl: 'https://api.athenahealth.com',
        method: 'GET',
        uri: path_join(version, practiceid, '/appointments', req.params.id, '/checkin'),
        auth: {
            'bearer': token
        },
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        json: true
    };
    request(checkInOptions, function (error, response, body) {
        if(error)
            console.log(error);

        // console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
        // console.log('the decoded data is: ' + JSON.stringify(body));
        res.send(body);

        // fire off the patient updates
    });

});

module.exports = router;