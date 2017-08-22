/**
 * Created by stevoperisic on 5/8/17.
 *
 * Appointments route and controller
 */
var express = require('express');
var athenaHealthAPI = require('../bin/athenahealthapi');
var AHAPI = new athenaHealthAPI.Connection('preview1',
    process.env.ATHENA_KEY,
    process.env.ATHENA_SECRET,
    process.env.NRIM_PRACTICE_ID
);
var router = express.Router();

router.get('/:id/startcheckin', function(req, res, next){
    console.log(req.params);
    // res.send('starting checkin');
    var appt = AHAPI.POST('/appointments/'+req.params.id+'/startcheckin');
    appt.on('done', function(data){
        console.log(data);
        res.send(data);
        // res.render('index', {appts: data.appointments});
    });
});

module.exports = router;