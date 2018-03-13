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
     * @description Check if the user is authenticated, if not redirect back to log-in page
     **/
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else {
            req.apptid = req.cookies.apptid;
            req.patientid = req.headers.patid;
            next();
        }
    },
    /**
     * @description GET the patient information first
     * @todo We must surface and record the Race and Ethnicity data for the patient
     **/
    function (req, res, next) {
        if (req.patientid) {
            next();
            var patient = req.app.locals.AHAPI.GET('/patients/' + req.patientid, {params: {showinsurance: true}});
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
        var checkInReqs = req.app.locals.AHAPI.GET('/appointments/' + req.apptid + '/checkin', {params: {}});
        checkInReqs.on('done', function (data) {
            console.log(JSON.stringify(data));
            next();
        });
    },
    /**
     * @description GET top insurance packages from aNET for this practice
     * @todo move this out to the applicatuon set-up step, this is practice level info not appointment level and it should be loaded ahead of time
     * @todo PERHAPS NOT NECESSARY AS THE INSURANCE CARD IS SCANNED BEFORE THE USER SEES THE FORM
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
     * @description GET appointment related insurances -
     * @todo NOT SURE IF WE NEED THIS - take it out
     **/
    function (req, res, next) {
        var apptRelatedInsurance = req.app.locals.AHAPI.GET('/appointments/' + req.apptid + '/insurances', {});
        apptRelatedInsurance.on('done', function (data) {
            // console.log(data);
            req.apptRelatedInsurance = data[0];
            next();
        });
    },
    /**
     * @description GET patient insurances
     * @todo also might not be necessary as the insurance is checked at the front-desk before the patient gets the tablet
     * PERHAPS TAKE OUT - OR OFFER AS A SEPARATE UPDATING SERVICE
     **/
    function (req, res, next) {
        // https://api.athenahealth.com/preview1/195900/patients/1/insurances
        // https://api.athenahealth.com/preview1/195900/insurancepackages
        var patient = req.app.locals.patient;
        var patientInsurances = req.app.locals.AHAPI.GET('/patients/' + patient.patientid + '/insurances', {});

        patientInsurances.on('done', function (data) {
            if (!data.error) {
                req.insurances = data.insurances;

                /**@todo what is this doing here - it has nothing to do with insurance ?? - should be moved or deleted**/
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
     * @todo - not sure if this is necessary also take out upon verification
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
 * DEMOGRAPHICS
 * @description Submit the patients demographics, this maps to a PUT call in aNet since
 * all patients should have a aNet account when they schedule an appointment.
 *
 * This app does not allow for scheduling, only check-in.
 *
 * https://developer.athenahealth.com/docs/read/workflows/digital_checkin/Registration_Race_and_Ethnicity_Requirements
 *
 * Athena Docs -> /preview1/:practiceid/patients/:patientid
 **/
router.post('/demographics', function (req, res, next) {
    console.log(req.body);
    var postData = req.body,
        aNEtAPI = req.params.aNetAPI,
        patientid = req.cookies.patientid;

    // cast the DOB to a date type
    postData.dob = postData.dob.split('-');
    postData.dob = postData.dob[1]+'/'+postData.dob[2]+'/'+postData.dob[0];

    console.log(postData);
    console.log(aNEtAPI);

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
    // res.status(200).send(req.body);
});

/**
 * ADDITIONAL INFO
 * @description Records parameters such as:
 * - Primary doctor
 * - Emergency Contact -> contactname
 * - Emergency Contact Relationship to patient -> contactrelationship
 * - Emergency Contact Telephone number -> contacthomephone, contactmobilephone
 **/
router.post('/additionalInfo', function (req, res, next){
    console.log(req.body);
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
    // res.status(200).send(req.body);
});

/**
 * @description Records that the patient read and understood their Rights & Responsibilities
 * https://developer.athenahealth.com/docs/read/workflows/digital_checkin/Digital_CheckIn_Forms_and_Documents
 * Athena Docs  -> https://developer.athenahealth.com/docs/read/workflows/patients/ESignature_Information
 * Athena API   -> /patients/{patientid}/documents
 * @params  - actionnote {string} Any note to accompany the creation of this document.
 *          - appointmentid {int} These can only be uploaded AFTER check-in.
 *          - attachmentcontents {any} The file that will become the document. PDFs are recommended.
 *          - autoclose {string} true or false, set this to true so that the document goes straight to the patients documents
 *          - documentsubclass {string} for signature set to 'ADMIN_LEGAL:Legal'
 **/
router.post('/patientRights', function (req, res, next){
    // console.log(req.body);
    var postData = {
            actionnote: 'Patient Rights & Responsibilities Form',
            appointmentid: req.cookies.apptid,
            attachmentcontents: req.body.signaturePatResps,
            autoclose: 'true',
            documentsubclass: 'ADMIN_LEGAL'
        },
        aNEtAPI = req.params.aNetAPI,
        patientid = req.cookies.patientid;

    var submitData = req.app.locals.AHAPI.POST('patients/' + patientid + '/documents', {params: postData});
    submitData.on('done', function (data) {
        console.log('****** Patient Documents POST response ******');
        console.log(data);
        if (!data.error) {
            res.sendStatus(200);
        } else {
            console.log('Error POSTing to API: ' + aNEtAPI + ', ' + data['error']);
            res.status(500).send(data)
        }
    });
    // res.status(200).send(req.body);
});

/**
 * @description Records that the patient is Consenting to disclose their health info to the provider's office
 *              also that their info will not be disclosed without written permission
 * Athena API   -> /patients/{patientid}/medicationhistoryconsentverified - In order to accept notice of patient privacy, release of (billing) information
 *              -> /patients/{patientid}/privacyinformationverified - for the release of medication authorization
 * @params  - expirationdate {string}
 *          - privacynotice {boolean}
 *          - signaturedatetime {string} If presenting an e-signature, the mm/dd/yyyy hh24:mi:ss formatted time that the signer signed
 *          - signaturename {string} If presenting an e-siganture, the name the signer typed, up to 100 characters.
 *          - signerrelationshiptopatientid {string} If presenting an e-signature, and the signer is signing on behalf of someone else, the relationship of the patient to the signer. There is a documentation page with details.
 *
 * Athena API   -> /patients/{patientid}/documents - to save the signature
 * @params  - actionnote {string} Any note to accompany the creation of this document.
 *          - appointmentid {int} These can only be uploaded AFTER check-in.
 *          - attachmentcontents {any} The file that will become the document. PDFs are recommended.
 *          - autoclose {string} true or false, set this to true so that the document goes straight to the patients documents
 *          - documentsubclass {string} for signature set to 'ADMIN_CONSENT:Consent'
 **/
router.post('/releaseInfoConsent', function (req, res, next){
    console.log(req.body);
    var postData = {
            actionnote: 'Release of Information Consent',
            appointmentid: req.cookies.apptid,
            attachmentcontents: '', // req.body.signaturePatResps,
            autoclose: 'true',
            documentsubclass: 'ADMIN_CONSENT'
        },
        aNEtAPI = req.params.aNetAPI,
        patientid = req.cookies.patientid;

    postData.appointmentid = req.cookies.apptid;
    postData.autoclose = 'true';
    postData.documentsubclass = 'ADMIN_CONSENT:Consent';
    var submitData = req.app.locals.AHAPI.POST('patients/' + patientid + '/documents', {params: postData});
    submitData.on('done', function (data) {
        console.log(data);
        if (!data.error) {
            res.sendStatus(200);
        } else {
            console.log('Error POSTing to API: ' + aNEtAPI + ', ' + data.error);
            res.status(500).send(data)
        }
    });
    // res.status(200).send(req.body);
});

/**
 * @description Submit the Insured/Responsible Party information pertaining to the insurance
 * @todo THIS SHOULD BE HANDLED ALREADY AT THE FRONT DESK AS TEH USER IS SUPPOSED TO PRESENT THE INSURANCE CARD
 * @todo TO THE FRONT DESK STAFF BEFORE RECEIVING THE DEVICE TO CHECK-IN
 * @todo handle the "self" case by taking the info from the demographics data for the patient
 *
 * https://developer.athenahealth.com/docs/read/workflows/digital_checkin/Digital_CheckIn_Insurance
 *
 **/
router.post('/insuredParty', function (req, res, next) {
    console.log(req.body);
    res.status(200).send(req.body);
});

/**
 * @description Submit the Primary and Secondary Insurance data
 * - an insurance package ID must be supplied in order to successfully POST insurance data
 * - we will call the available insurances Athena API to get those
 * @todo double check this is needed at all, per Athena Net the front desk staff is supposed to collect this via the
 * @todo insurance card scan before the check-in process starts
 **/
router.post('/insuranceInfo', function (req, res, next) {
        console.log(req.body);
        res.status(200).send(req.body);
    }
);


module.exports = router;