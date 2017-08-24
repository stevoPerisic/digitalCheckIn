/**
 * Created by stevoperisic on 5/1/17.
 *
 * patient medical history controller
 */

var express = require('express');
var router = express.Router();
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1',
    process.env.ATHENA_KEY,
    process.env.ATHENA_SECRET,
    process.env.NRIM_PRACTICE_ID
);
var formsConfig = require('../bin/formsConfig');

/*
* Patient Allergies recorded in aNet
* GET /:practiceid/chart/:patientid/allergies?departmentid=2
* PUT /:practiceid/chart/:patientid/allergies
*
* Family history
* GET /:practiceid/chart/:patientid/familyhistory
* PUT /:practiceid/chart/:patientid/familyhistory
*
* Medical History
* GET /:practiceid/chart/:patientid/medicalhistory
* PUT /:practiceid/chart/:patientid/medicalhistory
*
* Medications
* GET /:practiceid/chart/:patientid/medications
* PUT /:practiceid/chart/:patientid/medications
* POST /:practiceid/chart/:patientid/medications
*
* Social history
* GET /:practiceid/chart/:patientid/socialhistory
* PUT /:practiceid/chart/:patientid/socialhistory
* */


/* GET home page. */
router.get('/',
    // GET current appt. with patient data
    function (req, res, next) {
        if (req.cookies.apptid) {
            var params = {
                ignorerestrictions: true,
                showclaimdetail: false,
                showcopay: false,
                showexpectedprocedurecodes: false,
                showinsurance: false,
                showpatientdetail: true
            };
            var appointment = AHAPI.GET('/appointments/'+req.cookies.apptid, { params: params});

            appointment.on('done', function (data) {
                req.app.locals.currAppt = data[0];
                // res.send(data);
                next();
            });
        } else {
            res.render('patientMedicalHistory', {title: 'Patient medical history'});
        }
    },
    // GET recorded allergies for patient
    function (req, res, next) {
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };
        var allergies = AHAPI.GET('/chart/'+req.cookies.patientid+'/allergies', {params: params});
        allergies.on('done', function (data) {
           req.app.locals.allergies = data.allergies;
           next();
        });
    },
    // GET family health history
    function (req, res, next) {
        /*
        * In order to display and update the family history correctly we must import a list of SNOMED codes
        * ----
        * SOLUTION!
        * https://uts.nlm.nih.gov//license.html - fill out licence request form
        * to access:
        * https://documentation.uts.nlm.nih.gov/rest/search/
        * The above is the official SNOMED code search for diagnoses
        * ----
        * Other ideas:
        * http://browser.ihtsdotools.org/?
        * or run my own API for this
        * https://github.com/IHTSDO/sct-snapshot-rest-api
        * or
        * https://uts.nlm.nih.gov/home.html
        * or download here:
        * https://www.nlm.nih.gov/healthit/snomedct/international.html
        * */
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };
        var familyHistory = AHAPI.GET('/chart/'+req.cookies.patientid+'/familyhistory', {params: params});
        familyHistory.on('done', function (data) {
            req.app.locals.familyHistory = data.relatives;
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

        var socialhistory = AHAPI.GET('/chart/'+req.cookies.patientid+'/socialhistory', {params: params});
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
    // GET Surgical history
    function (req, res, next) {
        // docs https://developer.athenahealth.com/io-docs
        // /preview1/:practiceid/chart/:patientid/surgicalhistory
        // other possible params are
        // PATIENTFACINGCALL
        // THIRDPARTYUSERNAME
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };

        var surgicalhistory = AHAPI.GET('/chart/'+req.cookies.patientid+'/surgicalhistory', {params: params});
        surgicalhistory.on('done', function (data) {
            req.app.locals.surgicalHistory = data.procedures;
            next();
        });
    },
    // GET health history chart
    function (req, res, next) {
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };
        var medicalhistory = AHAPI.GET('/chart/' + req.cookies.patientid + '/medicalhistory', {params: params});
        medicalhistory.on('done', function (data) {
            // order by question id
            data.questions.sort(function (a, b) {
                return a.questionid - b.questionid;
            });
            req.app.locals.medicalHistory = data.questions;
            // res.send(data);
            next();
        });
    },
    // GET Medications history
    function (req, res, next) {
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };
        var medicationshistory = AHAPI.GET('/chart/' + req.cookies.patientid + '/medications', {params: params});
        medicationshistory.on('done', function (data) {
            req.app.locals.medicationHistory = data;
            // res.send(req.app.locals.medicationHistory);
            next();
        });
    },
    // Render page
    function (req, res, next) {
        // we've gathered all the patient med history data so render the screen
        res.render('patientMedicalHistory', {
            patient: req.app.locals.currAppt.patient,
            allergies: req.app.locals.allergies,
            maritalStatusSelect: formsConfig.maritalStatusSelect,
            insuredRelationship: formsConfig.insuredRelationship
        });
    }
);

/* medical history API:
 * https://developer.athenahealth.com/docs/read/chart/Medical_History
 * /preview1/:practiceid/chart/:patientid/medicalhistory
 *
 */

router.get('/:apptid/:patientid',
    function (req, res, next) {

        console.log('Cookies: ', req.cookies);

        var patient = AHAPI.GET('/patients/' + req.params.patientid, {params: {showinsurance: true}});
        patient.on('done', function (data) {
            // res.send(data);
            res.render('patientMedicalHistory', {
                patient: data[0],
                maritalStatusSelect: formsConfig.maritalStatusSelect,
                insuredRelationship: formsConfig.insuredRelationship
            });
        });
    }
);

router.post('/', function (req, res, next) {
   console.log(req.body);
   res.sendStatus(200);
});

module.exports = router;

