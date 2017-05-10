/**
 * Created by stevoperisic on 5/8/17.
 *
 * Appointments route and controller
 */
var request = require('request');
var express = require('express');
var router = express.Router();

// var AH_API = require('../bin/athenahealthapi');
// var AH_Connection = new AH_API.Connection('preview1', process.env.ATHENA_KEY, process.env.ATHENA_SECRET, '1');

var getAppts = require('../bin/naive');

/* GET home page. */
router.get('/', function (req, res, next) {
    // var parameters = {
    //     appointmentstatus: 'f',
    //     departmentid: 1,
    //     enddate: '04/29/2017',
    //     ignorerestrictions: 'false',
    //     showcancelled: 'false',
    //     showclaimdetail: 'false',
    //     showcopay: 'false',
    //     showexpectedprocedurecodes: 'false',
    //     showinsurance: 'false',
    //     showpatientdetail: 'true',
    //     showremindercalldetail: 'false',
    //     startdate: '04/21/2017'
    // };

    // var test = AH_Connection.GET('appointments/booked', {params: parameters});
    //
    // test.on('done', function(data){
    //     console.log(data);
    //
    //     res.send(data);
    // });
    //
    // test.on('error', function(err){
    //     console.log(err);
    //
    //     res.send(err);
    // });

    var data = getAppts();

    data.on('appts', function(data){
        // res.send(data);
        data = JSON.parse(data);
        // console.log(data);
        res.render('appointments', {title: 'Today\'s appointments', appts: data.appointments});
    });

    // res.render('appointments', {title: 'Today\'s appointments'});
});

module.exports = router;