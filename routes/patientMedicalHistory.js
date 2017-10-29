/**
 * Created by stevoperisic on 5/1/17.
 *
 * patient medical history controller
 */

var express = require('express');
var router = express.Router();
var formsConfig = require('../bin/formsConfig');

/**
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
 **/


/* GET home page. */
router.get('/',
    /**
     * @description Check if the user is authenticated, if not redirect back to home-page (log-in)
     **/
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else {
            next();
        }
    },
    /**
     * @description GET current appointment with patient data
     **/
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
            var appointment = req.app.locals.AHAPI.GET('/appointments/' + req.cookies.apptid, {params: params});

            appointment.on('done', function (data) {
                req.app.locals.currAppt = data[0];
                // res.send(data);
                next();
            });
        } else {
            res.render('patientMedicalHistory', {
                title: 'Patient medical history',
                maritalStatusSelect: formsConfig.maritalStatusSelect,
                insuredRelationship: formsConfig.insuredRelationship,
                isAuthenticated: req.isAuthenticated()
            });
        }
    },
    /**
     * @description GET Default pharmacy data if available
     **/
    function (req, res, next) {
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };
        var defaultPharmacy = req.app.locals.AHAPI.GET('/chart/' + + req.cookies.patientid + '/pharmacies/default', {params: params});
        defaultPharmacy.on('done', function (data) {
           req.app.locals.defaultPharmacy = data;
           next();
        });
    },
    /**
     * @description GET recorded allergies for patient
     **/
    function (req, res, next) {
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };
        var allergies = req.app.locals.AHAPI.GET('/chart/' + req.cookies.patientid + '/allergies', {params: params});
        allergies.on('done', function (data) {
            console.log(data);
            req.app.locals.allergies = data.allergies;
            next();
        });
    },
    /** GET family health history **/
    function (req, res, next) {
        /**
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
         **/
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };
        var familyHistory = req.app.locals.AHAPI.GET('/chart/' + req.cookies.patientid + '/familyhistory', {params: params});
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

        var socialhistory = req.app.locals.AHAPI.GET('/chart/' + req.cookies.patientid + '/socialhistory', {params: params});
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
    /** GET Surgical history **/
    function (req, res, next) {
        /** docs https://developer.athenahealth.com/io-docs
         * /preview1/:practiceid/chart/:patientid/surgicalhistory
         * other possible params are
         * PATIENTFACINGCALL
         * THIRDPARTYUSERNAME
         **/
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };

        var surgicalhistory = req.app.locals.AHAPI.GET('/chart/' + req.cookies.patientid + '/surgicalhistory', {params: params});
        surgicalhistory.on('done', function (data) {
            req.app.locals.surgicalHistory = data.procedures;
            next();
        });
    },
    /** GET health history chart **/
    function (req, res, next) {
        var params = {
            departmentid: req.app.locals.currAppt.departmentid
        };
        var medicalhistory = req.app.locals.AHAPI.GET('/chart/' + req.cookies.patientid + '/medicalhistory', {params: params});
        medicalhistory.on('done', function (data) {
            /** order by question id **/
            data.questions.sort(function (a, b) {
                return a.questionid - b.questionid;
            });
            req.app.locals.medicalHistory = data.questions;
            // res.send(data);
            next();
        });
    },
    /** GET Medications history **/
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
    // Render page
    function (req, res, next) {

        console.log('*************');
        console.log(req.session.passport.user);
        console.log(req.user);
        console.log(req.isAuthenticated());
        console.log('*************');

        // we've gathered all the patient med history data so render the screen
        res.render('patientMedicalHistory', {
            patient: req.app.locals.currAppt.patient,
            allergies: req.app.locals.allergies,
            socialHistory: req.app.locals.socialHistory,
            maritalStatusSelect: formsConfig.maritalStatusSelect,
            insuredRelationship: formsConfig.insuredRelationship,
            isAuthenticated: req.isAuthenticated()
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

        var patient = req.app.locals.AHAPI.GET('/patients/' + req.params.patientid, {params: {showinsurance: true}});
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

var postMessage = 'Posted Medical History';

router.post('/', function (req, res, next) {
    console.log(req.body);
    res.sendStatus(200);
});

/**
 * @description POST to /chart/configuration/facilities
 * - query string ?departmentid=2&name=Walgreens&ordertype=PRESCRIPTION&patientid=7496
 * - use to get closest pharmacy to the patient
 **/
router.post('/pharmacies', function(req, res, next){

});

router.post('/personalInfo',
    /**
     * @description First POST the personal info such as Preferred Pharmacy
     * - patients will doubtfully have changed their names on this form
     **/
    function (req, res, next) {
        next();
    },
    function (req, res, next) {
        console.log(req.body);
        /**
         * @todo post the data to the personal info and allergies section
         *
         * Before submitting allergies we should get the athena NET Id for the allergy
         * - if the allergy is not supported than we should not show it.... maybe
         *
         * Submit allergies in this form
         * {"allergenname": "aspirin", "allergenid": 13279, "reactions": [], "note": "DUE TO LOW PLATELTS"}
         **/
        res.status(200).send({message: postMessage, data: req.body});
    }
);

router.post('/familyHistory', function (req, res, next) {
    console.log(req.body);
    res.status(200).send({message: postMessage, data: req.body});
});

router.post('/socialHistory', function (req, res, next) {
    console.log(req.body);
    res.status(200).send({message: postMessage, data: req.body});
});

router.post('/medicalHistory', function (req, res, next) {
    console.log(req.body);
    res.status(200).send({message: postMessage, data: req.body});
});

router.post('/medications', function (req, res, next) {
    console.log(req.body);
    res.status(200).send({message: postMessage, data: req.body});
});


module.exports = router;

