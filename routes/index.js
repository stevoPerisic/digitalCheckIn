var express = require('express');
var router = express.Router();
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1',
    process.env.ATHENA_KEY,
    process.env.ATHENA_SECRET,
    process.env.NRIM_PRACTICE_ID
);

/* GET home page. */
router.get('/',
    function (req, res, next) {
        // get appointments
        var today = new Date();
        // console.log('Day ' + today.getDate());
        // console.log('Month ' + today.getMonth()+1); // since months start at 0
        // console.log('Year ' + today.getFullYear());

        var enddate = (today.getMonth()+1) + '/' + today.getDate() + '/' + today.getFullYear();

        var params = {
            appointmentstatus: 'f',
            departmentid: 2,
            enddate: '08/21/2017',// enddate,
            ignorerestrictions: 'false',
            showcancelled: 'false',
            showclaimdetail: 'false',
            showcopay: 'false',
            showexpectedprocedurecodes: 'false',
            showinsurance: 'true',
            showpatientdetail: 'true',
            showremindercalldetail: 'false',
            startdate: '06/30/2017'//enddate
        };

        var appointments = AHAPI.GET('/appointments/booked', {params: params});
        appointments.on('done', function(data){
            // res.send(data);
            // res.render('index', {appts: data.appointments, today: enddate});
            req.appts = data.appointments;
            req.enddate = enddate;
            next();
        });
    },
    // load the available employers from the system
    // function (req, res, next) {
    //     var employers = AHAPI.GET('/employers', {});
    //     employers.on('done', function(data) {
    //         // console.log(data);
    //         req.app.locals.employers = data.employers;
    //         next();
    //     });
    // },
    function (req, res, next) {
        // get providers so that we can display the name in the appts table
        // THIS SHOULD BE LOADED INITIALLY BEFORE THE HOME SCREEN OPENS
        var providers = AHAPI.GET('/providers', {});
        providers.on('done', function (data) {
            // save providers to local cache so we can query easier later
            req.app.locals.providers = data.providers;
            res.render('index', {appts: req.appts, today: req.enddate, providers: data.providers});
        });
    }

);

module.exports = router;
