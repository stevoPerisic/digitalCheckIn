var express = require('express');
var router = express.Router();
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1', process.env.ATHENA_KEY, process.env.ATHENA_SECRET, 195900);

/* GET home page. */
router.get('/', function (req, res, next) {
    var params = {
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

    var appointments = AHAPI.GET('/appointments/booked', {params: params});
    appointments.on('done', function(data){
        // res.send(data);
        res.render('index', {appts: data.appointments});
    });
});

module.exports = router;
