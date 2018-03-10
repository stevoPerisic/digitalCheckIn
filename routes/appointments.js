/**
 * Created by stevoperisic on 5/8/17.
 *
 * Appointments route and controller
 *
 * @todo create a data baseline for the day - a few appointments with basic data entered
 */
var express = require('express');
var router = express.Router();

/** GET routes **/
router.get('/checkin/getcheckinrequirements', function (req, res, next) {
    var apptreadiness = req.app.locals.AHAPI.GET('/appointments/' + req.cookies.apptid + '/checkin', {params: {}});
    apptreadiness.on('done', function (data) {
        console.log('****** APPT Readiness response ******');
        console.log(data);
        req.app.locals.apptReadiness = data;
        res.status(200).send(data);
    });
});

router.get('/checkin/cancel', function (req, res, next) {
    var cancelCheckIn = req.app.locals.AHAPI.POST('/appointments/' + req.cookies.apptid + '/cancelcheckin', {params: {}});
    cancelCheckIn.on('done', function (data) {
        console.log('Cancel check-in ' + JSON.stringify(data));
        res.redirect('/');
    });
});

/** POST routes **/
router.post('/checkin/startcheckin', function (req, res, next) {
    /**
     * @description POST Start check-in for this appointment
     * @todo - ENABLE LATER - for now we will NOT be starting the checkin because that freezes the patient
     **/
    console.log(req.params);
    var appt = req.app.locals.AHAPI.POST('/appointments/' + req.cookies.apptid + '/startcheckin');
    appt.on('done', function (data) {
        console.log('****** Start Check-In response ******');
        console.log(data);
        res.status(200).send(data);
        // res.render('index', {appts: data.appointments});
    });
});

module.exports = router;