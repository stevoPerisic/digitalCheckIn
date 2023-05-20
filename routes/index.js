var express = require('express');
var router = express.Router();

/**
 * @description GET home page - show list off appointments
 *
 * Ideas:
 * @todo There should be a home page where the user can choose the departments
 **/
router.get('/',
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
            req.app.locals.practiceData.then(function(data){
                // console.log(data)
                res.render('index', {
                    appts: req.app.locals.appts,
                    today: req.app.locals.enddate,
                    isAuthenticated: req.isAuthenticated()
                });
            }).catch(function(error){
                res.render('index', {
                    error: error,
                    appts: req.app.locals.appts,
                    today: req.app.locals.enddate,
                    isAuthenticated: req.isAuthenticated()
                });
            });
        }
    }
);

module.exports = router;
