/**
 * Patient Registration Form controller - Created by stevoperisic on 5/1/17.
 */
var express = require('express');
var router = express.Router();
var app = require('../app');
var formsConfig = require('../bin/formsConfig');

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
router.get('/',
    /**
     * @description GET the patient information first
     * @todo We must surface and record the Race and Ethnicity data for the patient
     **/
    function (req, res, next) {
        if (req.cookies.patientid) {
            var patient = req.app.locals.AHAPI.GET('/patients/' + req.cookies.patientid, {params: {showinsurance: true}});
            patient.on('done', function (data) {
                req.app.locals.patient = data[0];
                next();
            });
        } else {
            res.render('patientRegistration', {
                title: 'Patient registration',
                maritalStatusSelect: formsConfig.maritalStatusSelect,
                insuredRelationship: formsConfig.insuredRelationship,
                isAuthenticated: req.isAuthenticated()
            });
        }
    },
    /**
     * @description GET Appointment Check-in requirements so that we can tell which forms need filing-out
     * @todo we need to check with practice manager of this is necessary to guide the check-in process
     **/
    function (req, res, next) {
        var checkInReqs = req.app.locals.AHAPI.GET('/appointments/' + req.cookies.apptid + '/checkin', {params: {}});
        checkInReqs.on('done', function (data) {
            console.log(JSON.stringify(data));
            next();
        });
    },
    /**
     * @description GET top insurance packages from aNET for this practice
     **/
    function (req, res, next) {
        var topInsurancePckgs = req.app.locals.AHAPI.GET('/misc/topinsurancepackages', {});
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
        var apptRelatedInsurance = req.app.locals.AHAPI.GET('/appointments/' + req.cookies.apptid + '/insurances', {});
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
        var patientInsurances = req.app.locals.AHAPI.GET('/patients/' + patient.patientid + '/insurances', {});

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
     * - first check if there is an insurance recorded for the patient
     **/
    function (req, res, next) {
        if (req.app.locals.patient.insurances[0]) {
            var params = {};
            var patientID = req.app.locals.patient.patientid;
            var primaryInsID = req.app.locals.patient.insurances[0].insuranceid;
            var insuranceCard = req.app.locals.AHAPI.GET('/patients/' + patientID + '/insurances/' + primaryInsID + '/image', {params: params});
            insuranceCard.on('done', function (data) {
                if (!data.error) {
                    req.inscardImgs = data;
                } else {
                    console.log('Error: ' + data.error);
                }
                next();
            });
        } else {
            next();
        }
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
            primaryProvider: req.primaryProvider,
            apptid: req.cookies.apptid,
            isAuthenticated: req.isAuthenticated()
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

    var submitData = req.app.locals.AHAPI.PUT('patients/' + patientid, {params: postData});
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
        var submitInsuredParty = req.app.locals.AHAPI.PUT('patients/' + patientid + '/insurances/' + insuranceid, {params: postData});
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
            insuranceid: insuranceid,
            message: 'Insurance ID not present this patient has no insurance configured on their aNet account.'
        });
        console.log('Insurance ID not present this patient has no insurance configured on their aNet account.');
    }
});

/**
 * @description Submit the Primary and Secondary Insurance data
 * - an insurance package ID must be supplied in order to successfully POST insurance data
 * - we will call the available insurances Athena API to get those
 * @todo double check this is needed at all, per Athena Net the front desk staff is supposed to collect this via the
 *       insurance card scan before the check-in process starts
 **/
router.post('/insuranceInfo',
    /**
     * @description GET available insurance packages in Athena NET
     * @todo finish insurance submit
     **/
    function (req, res, next) {
        var params = {
            insuranceplanname: req.body.insuranceplanname,
            memberid: req.body.memberid
        };
        var insurancePckg = req.app.locals.AHAPI.GET('/insurancepackages', {params: params});
        insurancePckg.on('done', function (data) {
            console.log(data);
            if (req.body.insurances) {
                /**
                 * We need to find the best matching insurance package ID
                 * using the address provided and the emplyer name
                 **/

            }

            next();
        });
    },
    /**
     * @description POST the insurance data to the patient record in Athena
     **/
    function (req, res, next) {
        // var postData = req.body,
        //     patientid = req.cookies.patientid,
        //     primaryInsID = req.app.locals.patient.insurances[0].insuranceid,
        //     secondaryInsID = req.app.locals.patient.insurances[1].insuranceid;

        res.status(200).send('Posted stuff ;)');
    }
);

module.exports = router;