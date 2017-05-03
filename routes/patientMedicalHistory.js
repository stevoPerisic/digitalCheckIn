/**
 * Created by stevoperisic on 5/1/17.
 *
 * patient medical history controller
 */

var express = require('express');
var router = express.Router();

var athenaNaive = require('../bin/naive');

/* GET home page. */
router.get('/', function (req, res, next) {

    // Stop running the Athena APIs for now
    // athenaNaive();

    res.render('patientMedicalHistory', {title: 'Patient medical history'});
});

module.exports = router;

