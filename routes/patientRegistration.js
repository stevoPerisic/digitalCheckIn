/**
 * Patient Registration Form controller - Created by stevoperisic on 5/1/17.
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

/**
 * @description Patient registration form basic GET route, renders the form without any pre-populated data.
 **/
router.get('/', function (req, res, next) {
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

/**
 * @description Patient registration form GET route,
 * Middleware:
 * - get the patient info
 * - get practice level insurance packages
 * - get appointment related insurances - NOT SURE IF THIS IS NEEDED
 * - get patient assigned incurances
 * - render the page
 * @param apptid {String} Appointment ID
 * @param patientid {String} Patient ID
 **/
router.get('/:apptid/:patientid',
    /**
     * @description GET the patient information first
     **/
    function (req, res, next) {
        var patient = AHAPI.GET('/patients/' + req.params.patientid, {params: {showinsurance: true}});
        patient.on('done', function (data) {
            req.app.locals.patient = data[0];
            next();
        });
    },
    /**
     * @description GET top insurance packages from aNET for this practice
     **/
    function (req, res, next) {
        var topInsurancePckgs = AHAPI.GET('/misc/topinsurancepackages', {});
        topInsurancePckgs.on('done', function (data) {
            // console.log(data);
            req.topInsurancePckgs = data.insurancepackages;
            next();
        });
    },
    /**
     * @description GET appointment related insurances - NOT SURE IF WE NEED THIS
     **/
    function (req, res, next) {
        var apptRelatedInsurance = AHAPI.GET('/appointments/' + req.params.apptid + '/insurances', {});
        apptRelatedInsurance.on('done', function (data) {
            // console.log(data);
            req.apptRelatedInsurance = data[0];
            next();
        });
    },
    /**
     * @description GET patient insurances
     **/
    function (req, res, next) {
        // https://api.athenahealth.com/preview1/195900/patients/1/insurances
        // https://api.athenahealth.com/preview1/195900/insurancepackages
        var patient = req.app.locals.patient;
        var patientInsurances = AHAPI.GET('/patients/' + patient.patientid + '/insurances', {});

        patientInsurances.on('done', function (data) {
            if (!data.error) {
                req.insurances = data.insurances;
                if (req.app.locals.providers) {
                    req.primaryProvider = req.app.locals.providers.find(function (provider) {
                        if (parseInt(provider.providerid, 10) === parseInt(patient.primaryproviderid, 10)) {
                            return provider;
                        } else {
                            return false;
                        }
                    })
                }
            } else {
                console.log('Error getting patient level insurance: ' + data.error);
            }
            next();
        });
    },
    /**
     * @description GET insurance card images
     **/
    function (req, res, next) {
        var params = {};
        var patientID = req.app.locals.patient.patientid;
        var primaryInsID = req.app.locals.patient.insurances[0].insuranceid;
        var insuranceCard = AHAPI.GET('/patients/' + patientID + '/insurances/' + primaryInsID + '/image', {params: params});
        insuranceCard.on('done', function (data) {
            if (!data.error) {
                req.inscardImgs = data;
            } else {
                console.log('Error: ' + data.error);
            }
            next();
        });
    },
    /**
     * @description Render the form
     **/
    function (req, res, next) {
        res.render('patientRegistration', {
            patientInsurances: req.insurances,
            maritalStatusSelect: formsConfig.maritalStatusSelect,
            insuredRelationship: formsConfig.insuredRelationship,
            primaryIns: req.topInsurancePckgs.find(function (ins) {
                if (req.insurances[0]) {
                    return (ins.insurancepackageid === req.insurances[0].insurancepackageid.toString()) ? ins : false;
                } else {
                    return false;
                }
            }),
            secondaryIns: req.topInsurancePckgs.find(function (ins) {
                if (req.insurances[1]) {
                    return (ins.insurancepackageid === req.insurances[1].insurancepackageid.toString()) ? ins : false;
                } else {
                    return false;
                }
            }),
            primaryProvider: req.primaryProvider
        });
    }
);

/**
 * @description Base POST route, nothing happens
 **/
router.post('/', function (req, res, next) {
    console.log(req.body);
    res.sendStatus(200);
});

/**
 * @description Submit the patients demographics, this maps to a PUT call in aNet since
 * all patients should have a aNet account when they schedule an appointment.
 *
 * This app does not allow for scheduling, only check-in.
 **/
router.post('/demographics', function (req, res, next) {
    var postData = req.body,
        aNEtAPI = req.params.aNetAPI,
        patientid = req.cookies.patientid;

    var submitData = AHAPI.PUT('patients/' + patientid, {params: postData});
    submitData.on('done', function (data) {
        console.log(data);
        if (!data.error) {
            res.sendStatus(200);
        } else {
            console.log('Error POSTing to API: ' + aNEtAPI + ', ' + data.error);
            res.status(500).send(data)
        }
    });
});

/**
 * @description Submit the Insured/Responsible Party information pertaining to the insurance
 * @todo handle the "self" case by taking the info from the demographics data for the patient
 **/
router.post('/insuredParty', function (req, res, next) {
    var postData = req.body,
        patientid = req.cookies.patientid,
        insuranceid = req.app.locals.patient.insurances[0].insuranceid;

    if (insuranceid) {
        var submitInsuredParty = AHAPI.PUT('patients/' + patientid + '/insurances/' + insuranceid, {params: postData});
        submitInsuredParty.on('done', function (data) {
            console.log(data);
            if (!data.error) {
                res.sendStatus(200);
            } else {
                console.log('Error POST-ing insured party: ' + data.error);
                res.status(500).send(data)
            }
        });
    } else {
        res.status(500).send({
            insiranceid: req.app.locals.patient.insurances,
            message: 'Insurance ID not present this patient has no insurance configured on their aNet account.'
        });
        console.log('Insurance ID not present this patient has no insurance configured on their aNet account.');
    }
});

module.exports = router;