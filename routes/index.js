var express = require('express');
var router = express.Router();
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1', process.env.ATHENA_KEY, process.env.ATHENA_SECRET, 195900);

/* GET home page. */
router.get('/', function (req, res, next) {
    var today = new Date();
    console.log('Day ' + today.getDate());
    console.log('Month ' + today.getMonth()+1); // since months start at 0
    console.log('Year ' + today.getFullYear());

    var enddate = (today.getMonth()+1) + '/' + today.getDate() + '/' + today.getFullYear();

    var params = {
        appointmentstatus: 'f',
        departmentid: 1,
        enddate: '08/02/2017',// enddate,
        ignorerestrictions: 'false',
        showcancelled: 'false',
        showclaimdetail: 'false',
        showcopay: 'false',
        showexpectedprocedurecodes: 'false',
        showinsurance: 'true',
        showpatientdetail: 'true',
        showremindercalldetail: 'false',
        startdate: '07/30/2017'//enddate
    };

    var appointments = AHAPI.GET('/appointments/booked', {params: params});
    appointments.on('done', function(data){
        // res.send(data);
        res.render('index', {appts: data.appointments, today: enddate});
    });
});

module.exports = router;
