var express = require('express');
var router = express.Router();

/**
 * @description GET home page - show list off appointments
 *
 * Ideas:
 * @todo We need to have a login page,
 * @todo There should be a home page where the user can choose the departments
 **/
router.get('/',
    /**
     * @description GET all the available departments for the practice
     **/
    function (req, res, next) {
        var params = {
            providerlist: true,
            showalldepartments: false
        };

        var departments = req.app.locals.AHAPI.GET('/departments', {params: params});
        departments.on('done', function (data) {
            if (!data.error) {
                /**
                 * @todo offer a dropdown to select depts. for practices, currently only one valid dept in this practice
                 * so we will select the first dept and pick it's id to pass down to the appointment middleware
                 * The department ID needs to be an integer and it comes back as a string from this call
                 **/
                // console.log(data.departments);
                req.departmentid = parseInt(data.departments[0].departmentid, 10);
            } else {
                /**
                 * @todo handle error appropriately for the front-end, currently the appt. list just doesn't show
                 **/
                console.log(data.error);
            }
            next();
        });
    },
    /**
     * @description GET all appointments for the selected department for the chosen practice
     * @todo For scale we will have to make the practice ID a setting in the dashboard (to be created) once we start serving more than one practice
     **/
    function (req, res, next) {
        // get appointments
        var today = new Date(),
            enddate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear(),
            params = {
                appointmentstatus: 'f',
                departmentid: req.departmentid,
                enddate: enddate,
                ignorerestrictions: 'false',
                showcancelled: 'false',
                showclaimdetail: 'false',
                showcopay: 'false',
                showexpectedprocedurecodes: 'false',
                showinsurance: 'true',
                showpatientdetail: 'true',
                showremindercalldetail: 'false',
                startdate: '08/31/2017'//enddate
            };

        var appointments = req.app.locals.AHAPI.GET('/appointments/booked', {params: params});
        appointments.on('done', function (data) {
            /** order by date **/
            data.appointments.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
            req.appts = data.appointments;
            req.enddate = enddate;
            next();
        });
    },
    /**
     * @description GET available providers so that we can display their name in the appt. table
     * Also save the providers to the locals so that we can query later
     * @todo The providers could be loaded initially before we start the application
     **/
    function (req, res, next) {
        var providers = req.app.locals.AHAPI.GET('/providers', {});
        providers.on('done', function (data) {
            req.app.locals.providers = data.providers;
            next();
        });
    },
    /**
     * @description Render the appointments table on the page
     **/
    function (req, res, next) {
        res.render('index', {
            appts: req.appts,
            today: req.enddate,
            message: req.flash('loginMessage'),
            isAuthenticated: req.isAuthenticated()
        });
    }
);

module.exports = router;
