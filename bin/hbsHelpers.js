/**
 * Created by stevoperisic on 8/23/17.
 *
 * Helpers for the handlebars templates and partials
 */

var hbs = require('hbs');
// Load custom scripts - template specific
// http://stackoverflow.com/questions/25300017/how-to-ensure-the-javascript-is-at-the-bottom-of-the-code-in-express-handlebars
// http://stackoverflow.com/questions/34628978/register-custom-helper-express-and-hbs
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

hbs.registerHelper('formatPhoneNumber', function (options) {
    var s2 = ("" + options.hash.text).replace(/\D/g, '');
    var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
    return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
});

hbs.registerHelper('isInsurancePolicyHolder', function (data, options) {
    return (data === 1) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('providerName', function (providers, options) {
    var appointment = this;
    var name = providers.find(function (provider) {
        // one id was a string and the other was an integer - WTF!
        return (parseInt(provider.providerid, 10) === parseInt(appointment.providerid, 10)) ? provider : false;
    });
    return name.displayname;
});

// Helper to match the patients allergies with the checkboxes on the health history form
hbs.registerHelper('checkAllergy', function (allergies, options) {
    var regex, string, text = options.hash.text;
    var match = allergies.find(function (allergy) {
        string = allergy.allergenname.toString();
        regex = new RegExp(string, 'i');
        if (text.match(regex)) {
            console.log(options.fn(this));
            return true;
        }
    });

    if (match) {
        return options.fn(this);
    }
});

module.exports = hbs;
