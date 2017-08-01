/**
 * Created by stevoperisic on 5/1/17.
 *
 * patient medical history controller
 */

var express = require('express');
var router = express.Router();
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1', process.env.ATHENA_KEY, process.env.ATHENA_SECRET, 195900);
var formsConfig = require('../bin/formsConfig');

/* GET home page. */
router.get('/', function (req, res, next) {
    // quick hack might have to change this for the router example below
    if(req.cookies.patientid){
        var patient = AHAPI.GET('/patients/'+req.cookies.patientid, {params: {showinsurance: true}});
        patient.on('done', function(data){
            // res.send(data);
            res.render('patientMedicalHistory', {
                patient: data[0],
                maritalStatusSelect: formsConfig.maritalStatusSelect,
                insuredRelationship: formsConfig.insuredRelationship
            });
        });
    } else {
        res.render('patientMedicalHistory', {title: 'Patient medical history'});
    }
});

router.get('/:apptid/:patientid',
    function(req, res, next){

        console.log('Cookies: ', req.cookies);

        var patient = AHAPI.GET('/patients/'+req.params.patientid, {params: {showinsurance: true}});
        patient.on('done', function(data){
            // res.send(data);
            res.render('patientMedicalHistory', {
                patient: data[0],
                maritalStatusSelect: formsConfig.maritalStatusSelect,
                insuredRelationship: formsConfig.insuredRelationship
            });
        });
    }
);

module.exports = router;

