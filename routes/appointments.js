/**
 * Created by stevoperisic on 5/8/17.
 *
 * Appointments route and controller
 *
 * - CORS support -> https://www.html5rocks.com/en/tutorials/cors/#toc-adding-cors-support-to-the-server
 *
 * @todo create a data baseline for the day - a few appointments with basic data entered
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var allowedHosts = require('./../bin/allowedHosts');

router.use(function (req, res, next) {
    if(req.headers.origin && allowedHosts[req.headers.origin]){
        console.log('Yay we have an allowed host');
        res.header('Access-Control-Allow-Origin', req.headers.origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, cache-control');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.status(200).send('Ok');
    }
    else {
        next();
    }
});

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


/**
 * Set up JWT auth for the routes below
 **/

router.use(function (req, res, next) {
    passport.authenticate('jwt', {session: false}, function (err, user, info) {
        // console.log('User %o', err);
        // console.log('User %o', info);
        // console.log('User %o', user);

        if (err) {
            next(err);
        } else if (!user) {
            res.send({"status": info.message});
        } else {

            next();
        }
    })(req, res, next);
});

/**
 * GET Open appointments for a provider
 **/
router.get('/by-provider/:providerid/:startdate/:enddate',
    function (req, res) {
        if (!req.params.providerid || !req.params.startdate || !req.params.enddate) {
            res.status(400).send({
                error: true,
                message: 'Invalid parameters, need providerid, startdate and enddate to execute this request.'
            });
        }
        else {
            // https://api.athenahealth.com/preview1/3619/appointments/open?appointmenttypeid=45&departmentid=2&enddate=12%2F31%2F2019&ignoreschedulablepermission=false&providerid=9&startdate=11%2F01%2F2018
            var startdate = req.params.startdate.split('-').join('/');
            var enddate = req.params.enddate.split('-').join('/');

            var providerid = (process.env.NODE_ENV === 'development') ? '71' : req.params.providerid;

            req.app.locals.AHAPI.GET('/appointments/open', {
                params: {
                    departmentid: 2,
                    providerid: providerid, //req.params.providerid,
                    startdate: startdate,
                    enddate: enddate,
                    ignoreschedulablepermission: false,
                    reasonid: '2,3,4',
                    showfrozenslots: false
                }
            }).on('done', function (data) {
                console.log(data);
                res.send(data);
            });
        }
    }
);

router.get('/reasons/:providerid',
    function (req, res, next) {
        if (!req.params.providerid) {
            res.status(400).send({
                error: true,
                message: 'Invalid parameters, need providerid to execute this request.'
            });
        } else {
            // GET /patientappointmentreasons to narrow down a specific appointment reason

            var providerid = (process.env.NODE_ENV === 'development') ? '71' : req.params.providerid;

            req.app.locals.AHAPI.GET('/patientappointmentreasons', {
                params:{
                    'departmentid': '2',
                    'providerid': req.params.providerid
                }
            }).on('done', function (data) {
                console.log(data);
                res.send(data);
            });
        }
    }
);

/**
 * Create Appointment routes
 * Used for creating Athena Appointments from web form or chat-bot
 *
 * https://developer.athenahealth.com/docs/read/workflows/appointments/Online_Appointment_Scheduling
 *
 * Required input:
 * - First name
 * - Last name
 * - Date of Birth
 *
 * Optional Input:
 * - email
 * - mobile phone
 * - SSN
 * - zip code
 **/
router.post('/create',
    function (req, res, next) {
        console.log(req.body);
        // DO WE HAVE A PATIENT?
        req.app.locals.AHAPI.GET('/patients/enhancedbestmatch', {params: {
            'dob': req.body.dob,
            'firstname': req.body.firstName,
            'lastname': req.body.lastName,
            'mobilephone': req.body.mobilePhone,
            'email': req.body.email
        }}).on('done', function (data) {
            console.log('Existing patient %o', data[0]);
            if(data.length === 1) {
                res.locals.patient = data[0];
            }
            next();
        });
    },
    function (req, res, next) {
        // NEW Patients
        if(res.locals.patient){
            console.log('Skip the patient creation as we have the id: %s', res.locals.patient.patientid);
            next();
        } else {
            // POST to /patients to create a new patient and get a patient ID
            // You must supply
            // first and last name, a DOB, department ID,
            // and at least one patient phone number (home, mobile, work).
            req.app.locals.AHAPI.POST('/patients', {
                params: {
                    'dob': req.body.dob,
                    'firstname': req.body.firstName,
                    'lastname': req.body.lastName,
                    'mobilephone': req.body.mobilePhone,
                    'email': req.body.email
                }
            }).on('done', function (data) {
                console.log(data);
                // Use a GET to /patients to find the patient ID or GET /patients/enhancedbestmatch
                req.app.locals.AHAPI.GET('/patients', {
                    'patientid': data[0].patientid
                }).on('done', function (data) {
                    console.log(data);
                    res.locals.patient = data[0];
                    next();
                });
            });
        }
    },
    function (req, res, next) {
        console.log('Patient id %s', res.locals.patient.patientid);

        // PUT to /appointments/{appointmentid} to book a patient
        // required are the patient ID (from step 5),
        // a reason ID (asked from the patient using the list from step 3),
        // and an appointment ID (found in step 4)
        req.app.locals.AHAPI.PUT('/appointments/'+req.body.appointmentid, {params:{
            'appointmentid': req.body.appointmentid,
            'patientid': res.locals.patient.patientid,
            'reasonid': 4
        }}).on('done', function (data) {
            console.log(data);
            if(!data.error){
                res.send({success: true, appointment: data});
            } else {
                res.send(data);
            }
        });
    }
);

module.exports = router;