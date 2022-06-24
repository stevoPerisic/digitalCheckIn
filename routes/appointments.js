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

// check for origin header, then check if the origin is in our list of allowed origins
// send ok status for OPTIONS calls
router.use(function (req, res, next) {
    if(req.headers.origin && allowedHosts[req.headers.origin]){
        console.log('Yay we have an allowed host');
        res.header('Access-Control-Allow-Origin', req.headers.origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, cache-control');

    console.log('debug');
    console.log(req.method);

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.status(200).send('Ok');
    }
    else {
        next();
    }
});

/** GET routes **/
router.get('/checkin/getcheckinrequirements', function (req, res) {
    var apptreadiness = req.app.locals.AHAPI.GET('/appointments/' + req.cookies.apptid + '/checkin', {params: {}});
    apptreadiness.on('done', function (data) {
        console.log('****** APPT Readiness response ******');
        console.log(data);
        req.app.locals.apptReadiness = data;
        res.status(200).send(data);
    });
});

router.get('/checkin/cancel', function (req, res) {
    var cancelCheckIn = req.app.locals.AHAPI.POST('/appointments/' + req.cookies.apptid + '/cancelcheckin', {params: {}});
    cancelCheckIn.on('done', function (data) {
        console.log('Cancel check-in ' + JSON.stringify(data));
        res.redirect('/');
    });
});

/** POST routes **/
router.post('/checkin/startcheckin', function (req, res) {
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

            var providerid = req.params.providerid;

            req.app.locals.AHAPI.GET('/appointments/open', {
                params: {
                    departmentid: '2',
                    providerid: providerid, //req.params.providerid,
                    startdate: startdate,
                    enddate: enddate,
                    ignoreschedulablepermission: false,
                    reasonid: '1,2,3,4',
                    showfrozenslots: false
                }
            }).on('done', function (data) {
                console.log(data);
                if(data.appointments && data.appointments.length === 0){
                    console.log('No appointments available');
                    console.log(data);
                }
                res.send(data);
            });
        }
    }
);

/**
 * GET Appointment reasons for a provider
 **/
router.get('/reasons/:providerid',
    function (req, res) {
        if (!req.params.providerid) {
            res.status(400).send({
                error: true,
                message: 'Invalid parameters, need providerid to execute this request.'
            });
        } else {
            // GET /patientappointmentreasons to narrow down a specific appointment reason

            var providerid = req.params.providerid;

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

        var nameRegex = /[^0-9\.\,\"\?\!\;\:\#\$\%\&\(\)\*\+\-\/\<\>\=\@\[\]\\\^\_\{\}\|\~]+/;
        var dobRegex = /^(0?[1-9]|1[0-2])[\/](0?[1-9]|[12]\d|3[01])[\/](19|20)\d{2}$/;
        var phoneRegex = /(\+?( |-|\.)?\d{1,2}( |-|\.)?)?(\(?\d{3}\)?|\d{3})( |-|\.)?(\d{3}( |-|\.)?\d{4})/;
        var emailRegex = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/;

        var patientdata = {
            'dob': req.body.dob.match(dobRegex) ? req.body.dob : false,
            'firstname': req.body.firstName.match(nameRegex) ? req.body.firstName : false,
            'lastname': req.body.lastName.match(nameRegex) ? req.body.lastName : false,
            'mobilephone': req.body.mobilePhone.match(phoneRegex) ? req.body.mobilePhone: false,
            'email': req.body.email.match(emailRegex) ? req.body.email : false
        };

        res.locals.patientdata = patientdata;

        if(!patientdata.dob || !patientdata.firstname || !patientdata.lastname){
            res.status(400).send({
                error: true,
                message: 'Invalid parameters, need dob and name to execute this request.'
            });
        }
        else{
            // DO WE HAVE A PATIENT?
            req.app.locals.AHAPI.GET('/patients/enhancedbestmatch', {params: patientdata}).on('done', function (data) {
                console.log('Existing patient %s', data);
                if(data.length === 1) {
                    res.locals.patient = data[0];
                }
                next();
            });
        }
    },
    function (req, res, next) {
        // NEW Patients
        if(res.locals.patient){
            console.log('Skip the patient creation as we have the id: %s', res.locals.patient.patientid);
            next();
        } else {
            console.log('We will create a new patient now');
            // POST to /patients to create a new patient and get a patient ID
            // You must supply
            // first and last name, a DOB, department ID,
            // and at least one patient phone number (home, mobile, work)
            res.locals.patientdata.departmentid = 2;
            req.app.locals.AHAPI.POST('/patients', {params: res.locals.patientdata}).on('done', function (data) {
                console.log(data);
                // Use a GET to /patients to find the patient ID or GET /patients/enhancedbestmatch
                req.app.locals.AHAPI.GET('/patients/enhancedbestmatch', {params: res.locals.patientdata})
                    .on('done', function (data) {
                    console.log(data[0]);

                    res.locals.patient = data[0];
                    next();

                    // we return the patientId back to UI and go get insurance choices
                    // 02/13 per new requirements we are just going to try an create appointment
                    // no more insurance flow
                    // res.send(data[0]);
                });
            });
        }
    },
    function (req, res) {
        console.log('Patient id %s', res.locals.patient.patientid);

        // PUT to /appointments/{appointmentid} to book a patient
        // required are the patient ID (from step 5),
        // a reason ID (asked from the patient using the list from step 3),
        // and an appointment ID (found in step 4)
        var apptdata = {
            'appointmentid': req.body.appointmentid,
            'patientid': res.locals.patient.patientid,
            'reasonid': parseInt(req.body.patientappointmentreasons, 10)
        };
        req.app.locals.AHAPI.PUT('/appointments/'+req.body.appointmentid, {params: apptdata}).on('done', function (data) {
            console.log(data);
            if(!data.error){
                res.send({success: true, appointment: data});
            } else {
                res.send(data);
            }
        });
    }
);

/**
 * GET Search Athena Insurance Options
 *
 * ex: https://api.athenahealth.com/v1/3619/insurancepackages?insuranceplanname=BlueCross+BlueShield&memberid=300003
 *
 * Sample response:
 * {
    "insurances": [{
        "affiliations": ["BlueCross Secure Network"],
        "insuranceplanname": "BCBS-SC (Medicare Replacement\/Advantage - HMO)",
        "insurancepackageid": "492328",
        "addresslist": ["PO BOX 100300  COLUMBIA SC 29202-3300", "PO BOX 100191  COLUMBIA SC 29202-3191"]
    }, {
        "affiliations": ["BlueCross Total Network"],
        "insuranceplanname": "BCBS-SC (Medicare Replacement\/Advantage - PPO)",
        "insurancepackageid": "478179",
        "addresslist": ["PO BOX 100300  COLUMBIA SC 29202-3300", "PO BOX 100191  COLUMBIA SC 29202-3191"]
    }],
    "totalcount": 2
    }
 **/
router.get('/insurancepackages',
    function (req, res) {
        if (!req.query.insuranceplanname || !req.query.memberid) {
            res.status(400).send({
                error: true,
                message: 'Invalid parameters, need insuranceplanname and memberid to execute this request.'
            });
        } else {
            // GET /insurancepackages and send back to help the user select
            req.app.locals.AHAPI.GET('/insurancepackages', {
                params:{
                    'insuranceplanname': req.query.insuranceplanname,
                    'memberid': req.query.memberid
                }
            }).on('done', function (data) {
                console.log(data);
                res.send(data);
            });
        }
    }
);

/**
 * GET Update patient insurance
 *
 * ex: https://api.athenahealth.com/v1/3619/patients/:patientid/insurances?insurancepackageid={id}&memberid=300003
 **/
router.post('/patients/:patientid/insurance',
    function (req, res) {
        if (!req.params.patientid) {
            res.status(400).send({
                error: true,
                message: 'Invalid parameters, need patientid to execute this request.'
            });
        } else {
            var nameRegex = /[^0-9\.\,\"\?\!\;\:\#\$\%\&\(\)\*\+\-\/\<\>\=\@\[\]\\\^\_\{\}\|\~]+/;
            var firstname = req.body.insfirstName.match(nameRegex) ? req.body.insfirstName : '';
            var lastname = req.body.inslastName.match(nameRegex) ? req.body.inslastName : '';

            // POST /patients/:patientid/insurances to update
            req.app.locals.AHAPI.POST('/patients/'+req.params.patientid+'/insurances', {
                params:{
                    'insurancepackageid': req.body.insurancepackageid,
                    'relationshiptoinsured': 1,
                    'insurancepolicyholdersex': req.body.insurancepolicyholdersex,
                    'insurancepolicyholderfirstname': firstname,
                    'insurancepolicyholderlastname': lastname,
                    'insuranceidnumber': req.body.insuranceid,
                    'validateinsuranceidnumber': false
                }
            }).on('done', function (data) {
                console.log(data);
                res.send(data);
            });
        }
    }
);

module.exports = router;