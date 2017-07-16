/**
 * Created by stevoperisic on 5/1/17.
 *
 * patient registration controller
 */
var express = require('express');
var router = express.Router();
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1', process.env.ATHENA_KEY, process.env.ATHENA_SECRET, 195900);


/* GET home page. */
router.get('/', function (req, res, next) {

    console.log(req);

    res.render('patientRegistration', {title: 'Patient registration'});
});

router.get('/:apptId/:patientId',
    function(req, res, next){
        console.log(req.params);

        var patient = AHAPI.GET('/patients', {params: req.params});
        patient.on('done', function(data){
            res.send(data);
            // res.render('index', {appts: data.appointments});
        });
    }
);

// router.get('/:patientId',
//     function (req, res, next) {
//
//         console.log(req.params);
//
//         // we need to authenticate with Athena first
//         // this maybe needs to be done on log-in
//         // for now we will do it here
//         var authOptions =  {
//             baseUrl: 'https://api.athenahealth.com',
//             method: 'POST',
//             uri: path_join(auth_prefixes[version], '/token'),
//             auth: {
//                 user: process.env.ATHENA_KEY,
//                 pass: process.env.ATHENA_SECRET
//             },
//             headers: {
//                 'content-type': 'application/x-www-form-urlencoded'
//             },
//             json: true,
//             body: querystring.stringify({grant_type: 'client_credentials'})
//         };
//
//         request(authOptions, function (error, response, body) {
//             // body is the decompressed response body
//             if(error)
//                 console.log(error);
//
//             console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
//             console.log('the decoded data is: ' + JSON.stringify(body));
//
//             // var authorization = JSON.parse(body);
//             // once we have a positive response like so:
//             // {"access_token":"zd34cmqdbhnpxfd896wxzcbp","token_type":"bearer","expires_in":3600,"refresh_token":"fe7umf2b5pv8h2genzrfja6q"}
//             //
//             // we will store it in a session that expires in 3600 so that we will need to re-auth the next time
//             // for now we will store this in a global
//             token = body.access_token;
//
//             console.log(token);
//
//             next();
//         });
//
//     },
//     function(req, res, next){
//         var patientOptions = {
//             baseUrl: 'https://api.athenahealth.com',
//             method: 'GET',
//             uri: path_join(version, practiceid, '/patients', req.params.patientId),
//             auth: {
//                 'bearer': token
//             },
//             headers: {
//                 'content-type': 'application/x-www-form-urlencoded'
//             },
//             json: true
//         };
//         request(patientOptions, function (error, response, body) {
//             if(error){
//                 console.log(error);
//                 res.status(500).send(error);
//             }
//
//             // redirect to demographics route
//             // req.app.locals.checkinData = body;
//             // res.send(body);
//             res.render('patientRegistration', {title: 'Patient registration', patient: body[0]});
//         });
//     }
// );

module.exports = router;
