var express = require('express');
var router = express.Router();

/**
 * @description GET home page - show list off appointments
 *
 * Ideas:
 * @todo We need to implement SAML auth on the login page,
 * @todo There should be a home page where the user can choose the departments
 **/
router.get('/',
    /**
     * @description GET all the available departments for the practice
     * @todo offer a dropdown to select depts. for practices, currently only one valid dept in this practice
     **/
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            next();
        } else {
            var params = {
                providerlist: true,
                showalldepartments: false
            };

            var departments = req.app.locals.AHAPI.GET('/departments', {params: params});
            departments.on('done', function (data) {
                if (!data.error) {
                    /**
                     * Select the first dept and pick it's id to pass down to the appointment middleware
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
        }
    },
    /**
     * @description GET all appointments for the selected department for the chosen practice
     * - getting only the appointments for today's date
     * @todo For scale we will have to make the practice ID a setting in the dashboard (to be created) once we start serving more than one practice
     **/
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            next();
        } else {
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
                    startdate: '09/09/2017'//enddate
                };

            var appointments = req.app.locals.AHAPI.GET('/appointments/booked', {params: params});
            appointments.on('done', function (data) {

                /**
                 * @todo should be able to handle errors such as
                 * { error: 'Invalid practice.',  detailedmessage: 'The practice ID does not exist.' }
                 **/

                /** order by date **/
                data.appointments.sort(function (a, b) {
                    return new Date(b.date) - new Date(a.date);
                });
                req.appts = data.appointments;
                req.enddate = enddate;
                next();
            });
        }
    },
    /**
     * @description GET available providers so that we can display their name in the appt. table
     * - Also save the providers to the locals so that we can query later
     * @todo The providers could be loaded initially before we start the application
     **/
    function (req, res, next) {

        if (!req.isAuthenticated()) {
            next();
        } else {
            var providers = req.app.locals.AHAPI.GET('/providers', {});
            providers.on('done', function (data) {
                req.app.locals.providers = data.providers;
                next();
            });
        }
    },
    /**
     * @description Render the appointments table on the page
     **/
    function (req, res, next) {
        if (!req.isAuthenticated()) {
            var flashMessage = req.flash('loginMessage')[0];
            res.render('index', {
                message: flashMessage,
                isAuthenticated: req.isAuthenticated()
            });
        } else {
            res.render('index', {
                appts: req.appts,
                today: req.enddate,
                isAuthenticated: req.isAuthenticated()
            });
        }

    }
);

module.exports = router;
