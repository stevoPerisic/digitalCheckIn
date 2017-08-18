require('dotenv').config();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Load custon scripts - template specific
// http://stackoverflow.com/questions/25300017/how-to-ensure-the-javascript-is-at-the-bottom-of-the-code-in-express-handlebars
// http://stackoverflow.com/questions/34628978/register-custom-helper-express-and-hbs
var hbs = require('hbs');
hbs.registerHelper('section', function (name, options) {
    if (!this._sections) {
        this._sections = {};
    }
    this._sections[name] = options.fn(this);
    return null;
});
hbs.registerHelper('parseJSON', function (data, options) {
    // make an array out of the data string
    if (typeof(data) === 'string') {
        data = JSON.parse(data);
    }

    // for the special marital status selects we will add the patient object to the data array
    if (typeof(this.patient) === 'object') {
        data.patient = this.patient;
    }
    return options.fn(data);
});
hbs.registerHelper('isInsurancePolicyHolder', function (data, options) {
    return (data === 1) ? options.fn(this) : options.inverse(this);
});
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
var users = require('./routes/users');
var patientRegistration = require('./routes/patientRegistration');
var patientMedicalHistory = require('./routes/patientMedicalHistory');
var annualWellnessVisit = require('./routes/annualWellnessVisit');
var appointments = require('./routes/appointments');

var app = express();

// set up local vars as template data
hbs.localsAsTemplateData(app);
app.locals.mainMenu = {
    patientRegistration: (function () {
        return (this.patientid) ? '/patientRegistration/' + this.apptid + '/' + this.patientid :'/patientRegistration/' ;
    })(),
    patientMedicalHistory: '/patientMedicalHistory',
    annualWellnessVisit: '/annualWellnessVisit',
    apptid: '',
    patientid: ''
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
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
