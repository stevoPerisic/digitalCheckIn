/**
 * Created by stevoperisic on 5/8/17.
 *
 * Appointments route and controller
 *
 * @todo create a data baseline for the day - a few appointments with basic data entered
 */
var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8888');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
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
 * GET Open appointments for a provider
 * -
 **/


router.get('/providerlist', function (req, res) {
 // calendar
    // https://kylestetz.github.io/CLNDR/
});

router.get('/by-provider/:providerid/:startdate/:enddate', function (req, res) {
    // res.send('Ok');
    console.log(req.params);
    if(!req.params.providerid || !req.params.startdate || !req.params.enddate) {
        res.status(400).send({error: true, message: 'Invalid parameters, need providerid, startdate and enddate to execute this request.'});
    } else {
        // https://api.athenahealth.com/preview1/3619/appointments/open?appointmenttypeid=45&departmentid=2&enddate=12%2F31%2F2019&ignoreschedulablepermission=false&providerid=9&startdate=11%2F01%2F2018
        var startdate = req.params.startdate.split('-').join('/');
        var enddate = req.params.enddate.split('-').join('/');

        // departmentid=2&
        // enddate=11%2F30%2F2018&
        // ignoreschedulablepermission=false&
        // providerid=2&
        // reasonid=4&
        // showfrozenslots=false&
        // startdate=11%2F01%2F2018

        req.app.locals.AHAPI.GET('/appointments/open', {
            params: {
                departmentid: 2,
                providerid: req.params.providerid,
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
});

router.get('/reasons/:providerid', function (req, res) {
    if(!req.params.providerid) {
        res.status(400).send({error: true, message: 'Invalid parameters, need providerid to execute this request.'});
    } else {
        // GET /patientappointmentreasons to narrow down a specific appointment reason
        app.locals.AHAPI.GET('/patientappointmentreasons', {
            'departmentid': '2',
            'providerid': req.params.providerid
        }).on('done', function (data) {
            console.log(data);
            res.send(data);
        });
    }
});

/**
 * Create Appointment routes
 * Used for creating Athena Appointments from web form or chat-bot
 **/
router.post('/create', function (req, res) {
    // create a new appt
    /**
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

    console.log(req.sessionID);
    console.log(req.cookies);

    if (req.sessionID !== req.cookies.AHsession) {
        res.send('Cookie does not match session ID');
    } else {


        // https://developer.athenahealth.com/docs/read/workflows/appointments/Online_Appointment_Scheduling

        // Common for both New and Existing patients

        // GET /departments to get a list of departments at a practice
        app.locals.AHAPI.GET('/departments', {
            params: {
                providerlist: true,
                showalldepartments: false
            }
        }).on('done', function (data) {
            console.log(data);
        });

        // GET /providers to get a list of providers
        app.locals.AHAPI.GET('/providers', {}).on('done', function (data) {
            console.log(data);
            // app.locals.providers = data.providers;
            //
            // resolve({dataLoaded: true});
        });

        // GET /patientappointmentreasons to narrow down a specific appointment reason
        app.locals.AHAPI.GET('/patientappointmentreasons', {
            'departmentid': '2',
            'providerid': ''
        }).on('done', function (data) {
            console.log(data);
            // app.locals.providers = data.providers;
            //
            // resolve({dataLoaded: true});
        });

        // GET /appointments/open with a reason ID, department and provider (and date range) to retrieve a set of open appointments
        // https://api.athenahealth.com/preview1/3619/appointments/open?
        // departmentid=2&
        // enddate=11%2F30%2F2018&
        // ignoreschedulablepermission=false&
        // providerid=2&
        // reasonid=4&
        // showfrozenslots=false&
        // startdate=11%2F01%2F2018
        app.locals.AHAPI.GET('/appointments/open', {
            'departmentid': '2',
            'providerid': ''
        }).on('done', function (data) {
            console.log(data);
            // app.locals.providers = data.providers;
            //
            // resolve({dataLoaded: true});
        });

        // DO WE HAVE A PATIENT?
        app.locals.AHAPI.GET('/patients/enhancedbestmatch', {
            'dob': 'mm/dd/yyyy',
            'firstname': 'firstname',
            'lastname': 'lastname',
            'mobilephone': '',
            'homephone': ''
        }).on('done', function (data) {
            console.log(data);
            // app.locals.providers = data.providers;
            //
            // resolve({dataLoaded: true});
        });

        // NEW Patients

        // POST to /patients to create a new patient and get a patient ID
        // You must supply
        // first and last name, a DOB, department ID,
        // and at least one patient phone number (home, mobile, work).

        app.locals.AHAPI.POST('/patients', {
            'dob': 'mm/dd/yyyy',
            'firstname': 'firstname',
            'lastname': 'lastname',
            'mobilephone': '',
            'homephone': ''
        }).on('done', function (data) {
            console.log(data);
        });
        // PUT to /appointments/{appointmentid} to book a patient
        // required are the patient ID (from step 5),
        // a reason ID (asked from the patient using the list from step 3),
        // and an appointment ID (found in step 4)
        app.locals.AHAPI.PUT('/appointments/{appointmentid}', {
            'appointmentid': '',
            'patientid': '',
            'reasonid': ''
        }).on('done', function (data) {
            console.log(data);
        });

        // EXISTING Patients

        // Use a GET to /patients to find the patient ID or GET /patients/enhancedbestmatch
        app.locals.AHAPI.GET('/patients', {
            'patientid': ''
        }).on('done', function (data) {
            console.log(data);
            // app.locals.providers = data.providers;
            //
            // resolve({dataLoaded: true});
        });
        // first and last name, date of birth, and at least one other demographic field (phone number, SSN, etc.)
        // PUT to /appointments/{appointmentid} to book a patient
        // required are the patient ID (from step 5), a reason ID (asked from the patient using the list from step 3), and an appointment ID (found in step 4)
        app.locals.AHAPI.PUT('/appointments/{appointmentid}', {
            'appointmentid': '',
            'patientid': '',
            'reasonid': ''
        }).on('done', function (data) {
            console.log(data);
        });

        res.send('All done');
    }
});

module.exports = router;