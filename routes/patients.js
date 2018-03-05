/** Created by stevoperisic on 2/27/18. **/

'use strict';
var express = require('express');
var router = express.Router();

router.get('/:patientId/loadData',
    /**
     * @description Check if the user is authenticated, if not redirect back to log-in page
     **/
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else {
            next();
        }
    },
    /**
     * @description GET the patient information first
     * @todo We must surface and record the Race and Ethnicity data for the patient
     **/
    function (req, res, next) {
        var patient = req.app.locals.AHAPI.GET('/patients/' + req.cookies.patientid, {params: {showinsurance: true}});
        patient.on('done', function (data) {
            if(!data.error) {
                req.app.locals.patient = data[0];
                res.status(200).send('Patient data loaded');
            } else {
                console.log(data);
                res.status(200).send('Issue loading patient data');
            }
        });
    }
);

module.exports = router;