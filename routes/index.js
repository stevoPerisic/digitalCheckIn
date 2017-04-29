var express = require('express');
var router = express.Router();

var athenaNaive = require('../bin/naive');

/* GET home page. */
router.get('/', function (req, res, next) {

    // Stop running the Athena APIs for now
    // athenaNaive();

    res.render('index', {title: 'Express'});
});

module.exports = router;
