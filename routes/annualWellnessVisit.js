/**
 * Created by stevoperisic on 5/4/17.
 *
 * Medicare Annual Wellness Visit Questionnaire
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
            var appointment = AHAPI.GET('/appointments/'+req.cookies.apptid, {params: params});

            appointment.on('done', function (data) {
                req.app.locals.currAppt = data[0];
                // res.send(data);
                next();
            });
        } else {
            res.render('annualWellnessVisit', {title: 'Medicare Annual Wellness Visit Questionnaire'});
        }
    },
    // Render page
    function (req, res, next) {
        // we've gathered all the patient med history data so render the screen
        res.render('annualWellnessVisit', {
            patient: req.app.locals.currAppt.patient,
            // allergies: req.app.locals.allergies,
            maritalStatusSelect: formsConfig.maritalStatusSelect,
            insuredRelationship: formsConfig.insuredRelationship
        });
    }
    // Remove below
    // function (req, res, next) {
    //     if(req.cookies.patientid){
    //         var patient = AHAPI.GET('/patients/'+req.cookies.patientid, {params: {showinsurance: true}});
    //         patient.on('done', function(data){
    //             // res.send(data);
    //             res.render('annualWellnessVisit', {
    //                 title: 'Medicare Annual Wellness Visit Questionnaire',
    //                 patient: data[0],
    //                 maritalStatusSelect: formsConfig.maritalStatusSelect,
    //                 insuredRelationship: formsConfig.insuredRelationship
    //             });
    //         });
    //     } else {
    //
    //         res.render('annualWellnessVisit', {title: 'Medicare Annual Wellness Visit Questionnaire'});
    //     }
    // }
);

module.exports = router;

