/**
 * Created by stevoperisic on 5/1/17.
 *
 * patient registration controller
 */
var express = require('express');
var router = express.Router();
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1', process.env.ATHENA_KEY, process.env.ATHENA_SECRET, 195900);
var formsConfig = require('../bin/formsConfig');

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(req);
    res.render('patientRegistration', {
        title: 'Patient registration',
        maritalStatusSelect: formsConfig.maritalStatusSelect,
        insuredRelationship: formsConfig.insuredRelationship
    });
});

/*
 DOCS regsrding the dempgraphics for a patient
 https://developer.athenahealth.com/docs/read/patientinfo/Patient_Information#section-6

 Patient relationship mapping:
 https://developer.athenahealth.com/docs/read/reference/Patient_Relationship_Mapping
*/

router.get('/:apptid/:patientid',
    function(req, res, next){
        var patient = AHAPI.GET('/patients/'+req.params.patientid, {params: {showinsurance: true}});
        var aptInsurance = AHAPI.GET('/patients/'+req.params.patientid, {params: {showinsurance: true}});
        patient.on('done', function(data){
            req.patient = data[0];
            next();
            // res.send(data);
            // res.render('patientRegistration', {
            //     patient: data[0],
            //     aptInsurances:
            //     maritalStatusSelect: formsConfig.maritalStatusSelect,
            //     insuredRelationship: formsConfig.insuredRelationship
            // });
        });
    },
    function(req, res, next){
        // https://api.athenahealth.com/preview1/195900/patients/1/insurances
        // https://api.athenahealth.com/preview1/195900/insurancepackages

        var aptInsurance = AHAPI.GET('/patients/'+req.params.patientid+'/insurances', {});
        aptInsurance.on('done', function(data){
            console.log(data);
            res.render('patientRegistration', {
                patient: req.patient,
                aptInsurances: data.insurances,
                maritalStatusSelect: formsConfig.maritalStatusSelect,
                insuredRelationship: formsConfig.insuredRelationship
            });
        });
    }
);

module.exports = router;