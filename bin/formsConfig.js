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

/**
 * This is a custom created array for the NRIM practice
 * I created it by calling below API for each allergy that was listed in the paper form
 * https://api.athenahealth.com/preview1/3619/reference/allergies?searchvalue={search term}
 * @todo must sit with Stephanie and figure out the list, most allergies have multiple types like adhesives have three
 * or anesthetics have three, which one do we pick?
 **/
var allergies = {
    adhesiveTape: {
        "allergy": "adhesive tape",
        "allergenname": "adhesive tape",
        "allergyid": 14454,
        "allergenid": 14454
    },
    anesthesia: {
        "allergy": "Anesthetics - Ester Type- Parabens",
        "allergenname": "Anesthetics - Ester Type- Parabens",
        "allergyid": 24281,
        "allergenid": 24281
    },
    aspirin: {
        "allergy": "aspirin",
        "allergenname": "aspirin",
        "allergyid": 13279,
        "allergenid": 13279
    },
    codeine: {
        "allergy": "codeine",
        "allergenname": "codeine",
        "allergyid": 13264,
        "allergenid": 13264
    },
    dairy: {
        "allergy": "Milk Containing Products",
        "allergenname": "Milk Containing Products",
        "allergyid": 24458,
        "allergenid": 24458
    },
    iodine: {
        "allergy": "Iodinated Contrast- Oral and IV Dye",
        "allergenname": "Iodinated Contrast- Oral and IV Dye",
        "allergyid": 12157,
        "allergenid": 12157
    },
    latex: {
        "allergy": "latex",
        "allergenname": "latex",
        "allergyid": 18939,
        "allergenid": 18939
    },
    morphine: {
        "allergy": "morphine",
        "allergenname": "morphine",
        "allergyid": 13262,
        "allergenid": 13262
    },
    penicillin: {
        "allergy": "Penicillins",
        "allergenname": "Penicillins",
        "allergyid": 12449,
        "allergenid": 12449
    },
    sulfa: {
        "allergy": "Sulfa (Sulfonamide Antibiotics)",
        "allergenname": "Sulfa (Sulfonamide Antibiotics)",
        "allergyid": 12459,
        "allergenid": 12459
    },
    wheat: {
        "allergy": "wheat",
        "allergenname": "wheat",
        "allergyid": 28693,
        "allergenid": 28693
    }
};

module.exports = {
    maritalStatusSelect: maritalStatusSelect,
    insuredRelationship: insuredRelationship,
    allergies: allergies
};