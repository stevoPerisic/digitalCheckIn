/**
 * Created by stevoperisic on 5/4/17.
 *
 * Medicare Annual Wellness Visit Questionnaire
 */

var express = require('express');
var router = express.Router();

var athenaNaive = require('../bin/naive');

/* GET home page. */
router.get('/', function (req, res, next) {

    // Stop running the Athena APIs for now
    // athenaNaive();

    res.render('annualWellnessVisit', {title: 'Medicare Annual Wellness Visit Questionnaire'});
});

module.exports = router;

