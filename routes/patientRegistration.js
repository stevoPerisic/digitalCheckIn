/**
 * Created by stevoperisic on 5/1/17.
 *
 * patient registration controller
 */
var express = require('express');
var router = express.Router();
var app = require('../app');
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1',
    process.env.ATHENA_KEY,
    process.env.ATHENA_SECRET,
    process.env.NRIM_PRACTICE_ID
);
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
 DOCS regarding the demographics for a patient
 https://developer.athenahealth.com/docs/read/patientinfo/Patient_Information#section-6

 Patient relationship mapping:
 https://developer.athenahealth.com/docs/read/reference/Patient_Relationship_Mapping
 */

router.get('/:apptid/:patientid',
    // Get the patient first
    function (req, res, next) {
        /*
         * here we will set the appointment and the patient on all of the routes
         * perhaps we could do this via cookie? or session var?
         * for now we will set it as a local var for the express app
         */
        req.app.locals.mainMenu.apptid = req.params.apptid;
        req.app.locals.mainMenu.patientid = req.params.patientid;

        var patient = AHAPI.GET('/patients/' + req.params.patientid, {params: {showinsurance: true}});

        patient.on('done', function (data) {
            req.patient = data[0];
            next();
        });
    },
    // get top insurance packages
    function (req, res, next) {
        var topInsurancePckgs = AHAPI.GET('/misc/topinsurancepackages', {});
        topInsurancePckgs.on('done', function (data) {
            // console.log(data);
            req.topInsurancePckgs = data.insurancepackages;
            next();
        });
    },
    // get appointment related insurances - NOT SURE IF WE NEED THIS
    function (req, res, next) {
        var apptRelatedInsurance = AHAPI.GET('/appointments/' + req.params.apptid + '/insurances', {});
        apptRelatedInsurance.on('done', function (data) {
            // console.log(data);
            req.apptRelatedInsurance = data[0];
            next();
        });
    },
    // get patient insurances
    function (req, res, next) {

        // console.log(req.app.locals.providers);

        // https://api.athenahealth.com/preview1/195900/patients/1/insurances
        // https://api.athenahealth.com/preview1/195900/insurancepackages
        var patientInsurances = AHAPI.GET('/patients/' + req.params.patientid + '/insurances', {});
        patientInsurances.on('done', function (data) {
            // console.log(data.insurances);

            // req.primaryInsID = data.insurances[0].insuranceid;

            // next();

            // console.log(req.topInsurancePckgs);

            // var packageId = '0';
            // if (Array.isArray(data.insurances) && data.insurances.length > 0) {
            //     packageId = (typeof(data.insurances[0].insurancepackageid) === 'string') ?
            //         data.insurances[0].insurancepackageid :
            //         data.insurances[0].insurancepackageid.toString();
            // }

            var primaryProvider = {};
            if (req.app.locals.providers) {
                primaryProvider = req.app.locals.providers.find(function (provider) {
                    if (parseInt(provider.providerid, 10) === parseInt(req.patient.primaryproviderid, 10)) {
                        return provider;
                    } else {
                        return false;
                    }
                })
            }

            res.render('patientRegistration', {
                patient: req.patient,
                patientInsurances: data.insurances,
                maritalStatusSelect: formsConfig.maritalStatusSelect,
                insuredRelationship: formsConfig.insuredRelationship,
                primaryIns: req.topInsurancePckgs.find(function (ins) {
                    if (data.insurances[0]) {
                        return (ins.insurancepackageid === data.insurances[0].insurancepackageid.toString()) ? ins : false;
                    } else {
                        return false;
                    }
                }),
                secondaryIns: req.topInsurancePckgs.find(function (ins) {
                    if (data.insurances[1]) {
                        return (ins.insurancepackageid === data.insurances[1].insurancepackageid.toString()) ? ins : false;
                    } else {
                        return false;
                    }
                }),
                primaryProvider: primaryProvider
            });
        });
    }
    // ,
    // get insurance card images
    // function (req, res, next) {
    //     var insuranceCard = AHAPI.GET('/patients/'+req.params.patientid+'/insurances/'+req.primaryInsID+'/image', {});
    //     insuranceCard.on('done', function(data){
    //         res.send(data);
    //     })
    // }
);

router.post('/', function (req, res, next) {
    console.log(req.body);
    res.sendStatus(200);
});

/**
 * @description POST route for updating the patient registration form
 *
 * - Goal is to be able to re-use this for all portions of the Patient Registration form
 *
 * @param aNetMapping {string} this is the Athena Net API URI
 **/
router.post('/:aNetMapping', function (req, res, next) {
    console.log(req.body);
    console.log(req.params);

    var postData = req.body;
    var aNEtAPI = req.params;

    var submitData = AHAPI.PUT(aNEtAPI + req.cookies.patientid, {params: postData});
    submitData.on('done', function (data) {
        // console.log(data);
        if (!data[0].error) {
            res.sendStatus(200);
        }
    });
});

module.exports = router;