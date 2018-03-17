require('dotenv').config();

/**
 * @todo Encrypt traffic between browser and server
 * - https://medium.com/@weblab_tech/encrypted-client-server-communication-protection-of-privacy-and-integrity-with-aes-and-rsa-in-c7b180fe614e
 **/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('./bin/hbsHelpers');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');

// Handlebars partials for views
// Thanks to https://gist.github.com/benw/3824204 !!!
var fs = require('fs');
var partialsDir = __dirname + '/views/partials';
var filenames = fs.readdirSync(partialsDir);
filenames.forEach(function (filename) {
    var matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
        return;
    }
    var name = matches[1];
    var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
    hbs.registerPartial(name, template);
});
// End registration of partials for this section


var index = require('./routes/index');
var users = require('./routes/users')(passport);
var patients = require('./routes/patients');
var patientRegistration = require('./routes/patientRegistration');
var patientMedicalHistory = require('./routes/patientMedicalHistory');
var annualWellnessVisit = require('./routes/annualWellnessVisit');
var appointments = require('./routes/appointments');
var athenaHealthAPI = require('./bin/athenahealthapi');

var app = express();

// set up local vars as template data
hbs.localsAsTemplateData(app);
app.locals.mainMenu = {
    patientRegistration: (function () {
        return (this.patientid) ? '/patientRegistration/' + this.apptid + '/' + this.patientid : '/patientRegistration/';
    })(),
    patientMedicalHistory: '/patientMedicalHistory',
    annualWellnessVisit: '/annualWellnessVisit',
    apptid: '',
    patientid: ''
};

/**
 * Start the Athena NET API connection
 **/
app.locals.AHAPI = new athenaHealthAPI.Connection('preview1',
    process.env.ATHENA_KEY,
    process.env.ATHENA_SECRET,
    process.env.ATHENA_PREVIEW_PRACTICE_ID
    // process.env.NRIM_PRACTICE_ID
);

/**
 * Cache all the practice data (providers, appointments)
 **/
app.locals.AHAPI.status.on('ready', function () {
    app.locals.practiceData = require('./bin/practiceData.js')(app);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// pass passport for configuration
require('./bin/passport')(passport);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport setup
app.use(session({
    secret: process.env.PASSPORT_SECRET,
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

/**
 * For testing the forms so that we don't start the check-in process all
 * the time we will set this patient id on all calls
 **/
app.use( function (req, res, next) {
   if(!req.cookies.patientid){
       req.cookies.apptid = '961858';
       req.cookies.patientid = '29462';
       next();
   }
});

// set up routes
app.use('/', index);
app.use('/users', users);
app.use('/patients', patients);
app.use('/patientRegistration', patientRegistration);
app.use('/patientMedicalHistory', patientMedicalHistory);
app.use('/annualWellnessVisit', annualWellnessVisit);
app.use('/appointments', appointments);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
