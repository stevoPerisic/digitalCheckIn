if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

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
// var MongoDBStore = require('connect-mongodb-session')(session);
const HttpStatus = require('http-status-codes');
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
var applications = require('./routes/applications')(passport);
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

// =================== AthenaHealth API Connection Setup ===================

/**
 * Set up the AthenaHealth API connection and attach it to app.locals.
 * 
 * Depending on the environment (production or development), use the correct credentials and practice ID.
 * In production, use the live Athena credentials and practice ID from environment variables.
 * In non-production (development, staging, etc.), use sandbox credentials.
 * This allows seamless switching between environments and ensures sensitive data does not leak in dev.
 */
if(process.env.NODE_ENV === 'production') {
    app.locals.AHAPI = new athenaHealthAPI.Connection('v1',
        process.env.ATHENA_NEW_PROD_CLIENT_ID,
        process.env.ATHENA_NEW_PROD_SECRET,
        process.env.NRIM_PRACTICE_ID
    );
}
else {
    app.locals.AHAPI = new athenaHealthAPI.Connection('v1',
        process.env.ATHENA_KEY,
        process.env.ATHENA_SECRET,
        process.env.ATHENA_PREVIEW_PRACTICE_ID
    );
}


/**
 * Once the AthenaHealth API connection is ready, cache the practice data (such as providers and appointments).
 * This reduces the number of API calls and speeds up access to static data throughout the app.
 * Data is loaded via ./bin/practiceData.js, which must export a function that accepts the app as a parameter.
 */
app.locals.AHAPI.status.on('ready', function () {
    app.locals.practiceData = require('./bin/practiceData.js')(app);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// pass passport for configuration
require('./bin/passport')(passport);
require('./bin/passportJWT')(passport);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// =================== Session Store Logic ===================

/**
 * Configure session storage for user authentication and sessions.
 * 
 * By default, uses an in-memory session store (not recommended for production).
 * In production, switch to a PostgreSQL-backed session store for persistence and scalability.
 * - Session secret is required and loaded from the environment.
 * - Session cookies are set with a short maxAge for security.
 * - In production, sessions are stored in the database using connect-pg-simple.
 * - SSL options are set to allow self-signed certificates (often needed for managed DBs).
 * - Error handling is set up for the session store to log and debug DB issues.
 */
var sessionOpts = {
    secret: process.env.PASSPORT_SECRET,
    cookie: { maxAge: 60000 }
};

if(process.env.NODE_ENV === 'production') {
    var pgSession = require('connect-pg-simple')(session);
    var store = new pgSession({
       conObject: {
           connectionString: process.env.DATABASE_URL,
           ssl: {
               rejectUnauthorized: false
           }
       }
    });

    // Catch errors
    store.on('error', function (error) {
        console.error('Passport store error: %s', error);
    });

    sessionOpts.store = store;
    sessionOpts.resave = true;
    sessionOpts.saveUninitialized = true;
}

app.use(session(sessionOpts)); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

/**
 * For testing the forms so that we don't start the check-in process all
 * the time we will set this patient id on all calls
 **/
app.use( function (req, res, next) {
   if(!req.cookies.patientid){
       // req.cookies.apptid = '476075';
       // req.cookies.patientid = '8760';
       next();
   }
});

// set up routes
app.use('/', index);
app.use('/users', users);
app.use('/applications', applications);
app.use('/patients', patients);
app.use('/patientRegistration', patientRegistration);
app.use('/patientMedicalHistory', patientMedicalHistory);
app.use('/annualWellnessVisit', annualWellnessVisit);
app.use('/appointments', appointments);
app.use('/providers', function(req, res){
    var allowedHosts = require('./bin/allowedHosts');
    if(req.headers.origin && allowedHosts[req.headers.origin]){
        // console.log('Yay we have an allowed host');
        res.header('Access-Control-Allow-Origin', req.headers.origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, cache-control');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.status(HttpStatus.OK).send('Ok');
    } else {
        res.send(app.locals.providers);
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res) {

    console.error(err);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    res.render('error');
});

module.exports = app;
