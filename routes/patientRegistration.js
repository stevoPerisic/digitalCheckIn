/**
 * Created by stevoperisic on 5/1/17.
 *
 * patient registration controller
 */
var express = require('express');
var router = express.Router();
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1', process.env.ATHENA_KEY, process.env.ATHENA_SECRET, 195900);


/* GET home page. */
router.get('/', function (req, res, next) {

    console.log(req);

    res.render('patientRegistration', {title: 'Patient registration'});
});

router.get('/:apptid/:patientid',
    function(req, res, next){
        console.log(req.params);

        var patient = AHAPI.GET('/patients/'+req.params.patientid, {params: {}});
        patient.on('done', function(data){
            // res.send(data);
            res.render('patientRegistration', {patient: data[0]});
        });
    }
);

module.exports = router;
