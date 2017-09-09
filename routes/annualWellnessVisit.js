/**
 * Created by stevoperisic on 5/4/17.
 *
 * Medicare Annual Wellness Visit Questionnaire
 */

var express = require('express');
var router = express.Router();
var formsConfig = require('../bin/formsConfig');

/* GET home page. */
router.get('/',
    // GET current appt. with patient data
    function (req, res, next) {
        var params = {
            ignorerestrictions: true,
            showclaimdetail: false,
            showcopay: false,
            showexpectedprocedurecodes: false,
            showinsurance: false,
            showpatientdetail: true
        };

        if (req.cookies.apptid) {
            var appointment = req.app.locals.AHAPI.GET('/appointments/' + req.cookies.apptid, {params: params});

            appointment.on('done', function (data) {
                req.app.locals.currAppt = data[0];
                // res.send(data);
                next();
            });
        } else {
            res.render('annualWellnessVisit', {title: 'Medicare Annual Wellness Visit Questionnaire'});
        }
    },
    // GET the full patient record
    function (req, res, next) {
        var currAppt = req.app.locals.currAppt;
        var params = {
            departmentid: currAppt.departmentid,
            dob: currAppt.patient.dob,
            firstname: currAppt.patient.firstname,
            ignorerestrictions: true,
            lastname: currAppt.patient.lastname,
            showcustomfields: true,
            showinsurance: true
        };
        if (req.cookies.patientid) {
            var patient = req.app.locals.AHAPI.GET('/patients/enhancedbestmatch', {params: params});
            patient.on('done', function (data) {
                // res.send(data);
                req.app.locals.patientData = data[0];
                next();
            });
        }
    },
    // GET recorded medical problems
    function (req, res, next) {
        var params = {
            departmentid: req.app.locals.currAppt.departmentid,
            showinactive: false
        };

        var medicalProblems = req.app.locals.AHAPI.GET('/chart/' + req.app.locals.currAppt.patient.patientid + '/problems', {params: params});
        medicalProblems.on('done', function (data) {
            // res.send(data);
            req.app.locals.medicalProblems = data;
            next();
        });
    },
    // GET recorded allergies for patient
    function (req, res, next) {
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };
        var allergies = req.app.locals.AHAPI.GET('/chart/'+req.cookies.patientid+'/allergies', {params: params});
        allergies.on('done', function (data) {
            req.app.locals.allergies = data.allergies;
            next();
        });
    },
    // GET Medications history
    function (req, res, next) {
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };
        var medicationshistory = req.app.locals.AHAPI.GET('/chart/' + req.cookies.patientid + '/medications', {params: params});
        medicationshistory.on('done', function (data) {
            req.app.locals.medicationHistory = data;
            // res.send(req.app.locals.medicationHistory);
            next();
        });
    },
    // GET Social history
    function (req, res, next) {
        var params = {
            departmentid: req.app.locals.currAppt.departmentid,
            recipientcategory: 'PATIENT',
            showunansweredquestions: true
        };

        var socialhistory = req.app.locals.AHAPI.GET('/chart/'+req.cookies.patientid+'/socialhistory', {params: params});
        socialhistory.on('done', function (data) {
            // order by question id
            data.questions.sort(function (a, b) {
                return a.questionid - b.questionid;
            });
            req.app.locals.socialHistory = data.questions;
            // res.send(data);
            next();
        });
    },
    // Render page
    function (req, res, next) {
        // we've gathered all the patient med history data so render the screen
        res.render('annualWellnessVisit', {
            patient: req.app.locals.currAppt.patient,
            // allergies: req.app.locals.allergies,
            maritalStatusSelect: formsConfig.maritalStatusSelect,
            insuredRelationship: formsConfig.insuredRelationship,
            isAuthenticated: req.isAuthenticated()
        });
    }
);

router.post('/', function(req, res, next) {
   console.log(req.body);
   res.sendStatus(200);
});

module.exports = router;

