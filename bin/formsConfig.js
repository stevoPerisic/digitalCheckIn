/**
 * Created by stevoperisic on 7/24/17.
 *
 * Config file for the forms
 * Contains objects for select drop-downs and such variables used for rendering the forms
 *
 */
var maritalStatusSelect = [
    {"value": "D", "text": "Divorced"},
    {"value": "M", "text": "Married"},
    {"value": "S", "text": "Single"},
    {"value": "W", "text": "Widowed"},
    {"value": "X", "text": "Separated"},
    {"value": "P", "text": "Partner"}
];

var insuredRelationship = [
    {"value": "2", "text": "Spouse"},
    {"value": "18", "text": "Parent"},
    {"value": "10", "text": "Guardian"},
    {"value": "1", "text": "Self"},
    {"value": "13", "text": "None of the above"}
];

module.exports = {
    maritalStatusSelect: maritalStatusSelect,
    insuredRelationship: insuredRelationship
};