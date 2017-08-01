/**
 * Created by stevoperisic on 5/4/17.
 *
 * Medicare Annual Wellness Visit Questionnaire
 */

var express = require('express');
var router = express.Router();
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1', process.env.ATHENA_KEY, process.env.ATHENA_SECRET, 195900);
var formsConfig = require('../bin/formsConfig');

/* GET home page. */
router.get('/', function (req, res, next) {

    if(req.cookies.patientid){
        var patient = AHAPI.GET('/patients/'+req.cookies.patientid, {params: {showinsurance: true}});
        patient.on('done', function(data){
            // res.send(data);
            res.render('annualWellnessVisit', {
                title: 'Medicare Annual Wellness Visit Questionnaire',
                patient: data[0],
                maritalStatusSelect: formsConfig.maritalStatusSelect,
                insuredRelationship: formsConfig.insuredRelationship
            });
        });
    } else {

        res.render('annualWellnessVisit', {title: 'Medicare Annual Wellness Visit Questionnaire'});
    }
});

module.exports = router;

