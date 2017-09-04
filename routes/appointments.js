/**
 * Created by stevoperisic on 5/8/17.
 *
 * Appointments route and controller
 */
var express = require('express');
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1',
    process.env.ATHENA_KEY,
    process.env.ATHENA_SECRET,
    process.env.NRIM_PRACTICE_ID
);
var router = express.Router();

router.get('/:apptid/startcheckin',
    /**
     * @description GET Appointment Check-in readiness
     * @todo what makes the appt. ready?
     **/
    function (req, res, next) {
        var apptreadiness = AHAPI.GET('/appointments/' + req.params.apptid + '/checkin', {params: {}});
        apptreadiness.on('done', function (data) {
            console.log(data);
            next();
        });
    },
    /**
     * @description POST Start check-in for this appointment
     * @todo - ENABLE LATER - for now we will NOT be starting the checkin because that freezes the patient
     **/
    function (req, res, next) {
        console.log(req.params);

        res.send({success: true});

        // var appt = AHAPI.POST('/appointments/' + req.params.apptid + '/startcheckin');
        // appt.on('done', function (data) {
        //     console.log(data);
        //     res.send(data);
        //     // res.render('index', {appts: data.appointments});
        // });
    }
);

module.exports = router;