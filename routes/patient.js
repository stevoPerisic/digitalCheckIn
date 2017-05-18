/**
 * Created by stevoperisic on 5/16/17.
 *
 * Patients route controller
 */

// content-type must be application/x-www-form-urlencoded

var patientParameters = {
    patientid: 'int', // required
    practiceid: 'int', // required
    address1: 'address1', // Patient's address - 1st line (Max length: 100)
    address2: 'address2', // Patient's address - 2nd line (Max length: 100)
    agriculturalworker: 'no/Patient Declined/yes', // Used to identify this patient as an agricultural worker. Only settable if client has Social Determinant fields turned on.
    agriculturalworkertype: 'Migrant/Seasonal/Unspecified', // For patients that are agricultural workers, identifies the type of worker. Only settable if client has Social Determinant fields turned on.
    altfirstname: 'String', // Alternate first name that differs from legal name. This is only available in practices with the appropriate practice settings.
    assignedsexatbirth: 'Male/Female/Chose not to disclose', // Sex that this patient was assigned at birth. This is only available in practices with the appropriate practice settings.
    caresummarydeliverypreference: 'Paper/Portal', // The patient's preference for care summary delivery.
    city: 'String', // Patient's city (Max length: 30)
    clinicalordertypegroupid: 'String', //The clinical order type group of the clinical provider (Prescription: 10, Lab: 11, Vaccinations: 16).
    consenttocall: 'false/true - string', // The flag is used to record the consent of a patient to receive automated calls per FCC requirements. The requested legal language is 'Entry of any telephone contact number constitutes written consent to receive any automated, prerecorded, and artificial voice telephone calls initiated by the Practice. To alter or revoke this consent, visit the Patient Portal "Contact Preferences" page.'
    consenttotext: 'false/true - string', // The flag is used to record the consent of a patient to receive text messages per FCC requirements. In order for this to be true, a valid mobile phone number must be set and the practice setting "Hide SMS Opt-in option" must be set to Off.
    contacthomephone: 'String', // Emergency contact home phone. Invalid numbers in a GET/PUT will be ignored. Patient phone numbers and other data may change, and one phone number may be associated with multiple patients. You are responsible for taking additional steps to verify patient identity and for using this data in accordance with applicable law, including HIPAA. Invalid numbers in a POST will be ignored, possibly resulting in an error.
    contactmobilephone: 'String', // Emergency contact mobile phone. Invalid numbers in a GET/PUT will be ignored. Patient phone numbers and other data may change, and one phone number may be associated with multiple patients. You are responsible for taking additional steps to verify patient identity and for using this data in accordance with applicable law, including HIPAA. Invalid numbers in a POST will be ignored, possibly resulting in an error.
    contactname: 'String', // The name of the (emergency) person to contact about the patient. The contactname, contactrelationship, contacthomephone, and contactmobilephone fields are all related to the emergency contact for the patient. They are NOT related to the contractpreference_* fields.
    contactpreference: 'Home phone/Mail/Mobile phone/Portal/Work Phone', // The MU-required field for "preferred contact method". This is not used by any automated systems.
    contactpreference_announcement_email: 'false/true - string', // If set, the patient has indicated a preference to get or not get "announcement" communications delivered via email. Note that this will not be present if the practice or patient has not set it.For completeness, turning email off is supported via the API, but it is discouraged. When email is off, patients may not not get messages from the patient portal.
    contactpreference_announcement_phone: 'false/true - string', // If set, the patient has indicated a preference to get or not get "announcement" communications delivered via phone. Note that this will not be present if the practice or patient has not set it.
    contactpreference_announcement_sms: 'false/true - string', // If set, the patient has indicated a preference to get or not get "announcement" communications delivered via SMS. Note that this will not be present if the practice or patient has not set it.For SMS, there is specific terms of service language that must be used when displaying this as an option to be turned on. Turning on must be an action by the patient, not a practice user.
    contactpreference_appointment_email: 'false/true - string', // If set, the patient has indicated a preference to get or not get "appointment" communications delivered via email. Note that this will not be present if the practice or patient has not set it.For completeness, turning email off is supported via the API, but it is discouraged. When email is off, patients may not not get messages from the patient portal.
    contactpreference_appointment_phone: 'false/true - string', // If set, the patient has indicated a preference to get or not get "appointment" communications delivered via phone. Note that this will not be present if the practice or patient has not set it.
    contactpreference_appointment_sms: 'false/true - string', // If set, the patient has indicated a preference to get or not get "appointment" communications delivered via SMS. Note that this will not be present if the practice or patient has not set it.For SMS, there is specific terms of service language that must be used when displaying this as an option to be turned on. Turning on must be an action by the patient, not a practice user.
    contactpreference_billing_email: 'false/true - string', // If set, the patient has indicated a preference to get or not get "billing" communications delivered via email. Note that this will not be present if the practice or patient has not set it.For completeness, turning email off is supported via the API, but it is discouraged. When email is off, patients may not not get messages from the patient portal.
    contactpreference_billing_phone: 'false/true - string', // If set, the patient has indicated a preference to get or not get "billing" communications delivered via phone. Note that this will not be present if the practice or patient has not set it.
    contactpreference_billing_sms: 'false/true - string', // If set, the patient has indicated a preference to get or not get "billing" communications delivered via SMS. Note that this will not be present if the practice or patient has not set it.For SMS, there is specific terms of service language that must be used when displaying this as an option to be turned on. Turning on must be an action by the patient, not a practice user.
    contactpreference_lab_email: 'false/true - string', // If set, the patient has indicated a preference to get or not get "lab" communications delivered via email. Note that this will not be present if the practice or patient has not set it.For completeness, turning email off is supported via the API, but it is discouraged. When email is off, patients may not not get messages from the patient portal.
    contactpreference_lab_phone: 'false/true - string', // If set, the patient has indicated a preference to get or not get "lab" communications delivered via phone. Note that this will not be present if the practice or patient has not set it.
    contactpreference_lab_sms: 'false/true - string', // If set, the patient has indicated a preference to get or not get "lab" communications delivered via SMS. Note that this will not be present if the practice or patient has not set it.For SMS, there is specific terms of service language that must be used when displaying this as an option to be turned on. Turning on must be an action by the patient, not a practice user.
    contactrelationship: 'Child/Cousin/Friend/Guardian/Other/Parent/Sibling/Spouse', // Emergency contact relationship (one of SPOUSE, PARENT, CHILD, SIBLING, FRIEND, COUSIN, GUARDIAN, OTHER)
    countrycode3166: 'String', // 'US' Patient's country code (ISO 3166-1)
    deceaseddate: 'String', // If present, the date on which a patient died.
    defaultpharmacyncpdpid: 'String', // The NCPDP ID of the patient's preferred pharmacy. See http://www.ncpdp.org/ for details. Note: if updating this field, please make sure to have a CLINICALORDERYPEGROUPID field as well.
    departmentid: 'int', // Primary (registration) department ID.
    dob: 'String', // Patient's DOB (mm/dd/yyyy)
    driverslicenseexpirationdate: 'String', // The expiration date of the patient's driver's license.
    driverslicensenumber: 'String', // The number of the patient's driver's license
    driverslicensestateid: 'String', // The state of the patient's driver's license. This is in the form of a 2 letter state code.
    email: 'String', // Patient's email address. 'declined' can be used to indicate just that.
    employerid: 'int', // The patient's employer's ID (from /employers call)
    employerphone: 'String', // The patient's employer's phone number. Normally, this is set by setting employerid. However, setting this value can be used to override this on an individual patient. Invalid numbers in a GET/PUT will be ignored. Patient phone numbers and other data may change, and one phone number may be associated with multiple patients. You are responsible for taking additional steps to verify patient identity and for using this data in accordance with applicable law, including HIPAA. Invalid numbers in a POST will be ignored, possibly resulting in an error.
    ethnicitycode: 'String', // Ethnicity of the patient, using the 2.16.840.1.113883.5.50 codeset. See http://www.hl7.org/implement/standards/fhir/terminologies-v3.html Special case: use "declined" to indicate that the patient declined to answer.
    firstname: 'String', // Patient's first name
    genderidentity: 'String', // Gender this patient identifies with. This is only available in practices with the appropriate practice settings. To see the available options for this input, please see GET /configuration/patients/genderidentity
    guarantoraddress1: 'String', // Guarantor's address (Max length: 100)
    guarantoraddress2: 'String', // Guarantor's address - line 2 (Max length: 100)
    guarantoraddresssameaspatient: 'false/true - string', // If set, the address of the guarantor is the same as the patient.
    guarantorcity: 'String', // Guarantor's city (Max length: 30)
    guarantorcountrycode3166: 'String', // Guarantor's country code (ISO 3166-1)
    guarantordob: 'String', // Guarantor's DOB (mm/dd/yyyy)
    guarantoremail: 'String', // Guarantor's email address
    guarantoremployerid: 'int', // The guarantor's employer's ID (from /employers call)
    guarantorfirstname: 'String', // Guarantor's first name
    guarantorlastname: 'String', // Guarantor's last name
    guarantormiddlename: 'String', // Guarantor's middle name
    guarantorphone: 'String', // Guarantor's phone number. Invalid numbers in a GET/PUT will be ignored. Patient phone numbers and other data may change, and one phone number may be associated with multiple patients. You are responsible for taking additional steps to verify patient identity and for using this data in accordance with applicable law, including HIPAA. Invalid numbers in a POST will be ignored, possibly resulting in an error.
    guarantorrelationshiptopatient: 'String', // The guarantor's relationship to the patient - check https://developer.athenahealth.com/io-docs for examples
    guarantorssn: 'String', // Guarantor's SSN
    guarantorstate: 'String', // Guarantor's state (2 letter abbreviation)
    guarantorsuffix: 'String', // Guarantor's name suffix
    guarantorzip: 'String', // Guarantor's zip
    guardianfirstname: 'String', // The first name of the patient's guardian.
    guardianlastname: 'String', // The last name of the patient's guardian.
    guardianmiddlename: 'String', // The middle name of the patient's guardian.
    guardiansuffix: 'String', // The suffix of the patient's guardian.
    hasmobileyn: 'false/true - string', // Set to false if a client has declined a phone number.
    homeboundyn: 'false/true - string', // If the patient is homebound, this is true.
    homeless: 'No/Patient declined/yes', // Used to identify this patient as homeless. Only settable if client has Social Determinant fields turned on.
    homelesstype: 'String', // For patients that are homeless, provides more detail regarding the patient's homeless situation. Only settable if client has Social Determinant fields turned on.
    homephone: 'String', // The patient's home phone number. Invalid numbers in a GET will be ignored. Patient phone numbers and other data may change, and one phone number may be associated with multiple patients. You are responsible for taking additional steps to verify patient identity and for using this data in accordance with applicable law, including HIPAA. Only phone numbers that exist in the North American Naming Plan (NANP) are acceptable for input.
    ignorerestrictions: 'false/true - string', // Set to true to allow ability to find patients with record restrictions and blocked patients. This should only be used when there is no reflection to the patient at all that a match was found or not found.
    industrycode: 'String', // Industry of the patient, using the US Census industry code (code system 2.16.840.1.113883.6.310). "other" can be used as well.
    language6392code: 'String', // Language of the patient, using the ISO 639.2 code. (http://www.loc.gov/standards/iso639-2/php/code_list.php; "T" or terminology code) Special case: use "declined" to indicate that the patient declined to answer.
    lastname: 'String', // Patient's last name
    lookupdepartmentid: 'int', // Use this in practices that register copies of patients in different departments in order to make sure you are updating the correct version of the patient.
    maritalstatus: 'String', // Marital Status (D=Divorced, M=Married, S=Single, U=Unknown, W=Widowed, X=Separated, P=Partner)
    middlename: 'String', // Patient's middle name
    mobilecarrierid: 'String', // The ID of the mobile carrier, from /mobilecarriers or the list below.
    mobilephone: 'String', // The patient's mobile phone number. On input, 'declined' can be used to indicate no number. (Alternatively, hasmobile can also be set to false. "declined" simply does this for you.) Invalid numbers in a GET will be ignored. Patient phone numbers and other data may change, and one phone number may be associated with multiple patients. You are responsible for taking additional steps to verify patient identity and for using this data in accordance with applicable law, including HIPAA. Only phone numbers that exist in the North American Naming Plan (NANP) are acceptable for input.
    nextkinname: 'String', // The full name of the next of kin.
    nextkinphone: 'String', // The next of kin phone number. Invalid numbers in a GET/PUT will be ignored. Patient phone numbers and other data may change, and one phone number may be associated with multiple patients. You are responsible for taking additional steps to verify patient identity and for using this data in accordance with applicable law, including HIPAA. Invalid numbers in a POST will be ignored, possibly resulting in an error.
    nextkinrelationship: 'String', // The next of kin relationship (one of SPOUSE, PARENT, CHILD, SIBLING, FRIEND, COUSIN, GUARDIAN, OTHER)
    notes: 'String', // Notes associated with this patient.
    occupationcode: 'String', // Occupation of the patient, using the US Census occupation code (code system 2.16.840.1.113883.6.240). "other" can be used as well.
    onlinestatementonlyyn: 'false/true - string', // Set to true if a patient wishes to get e-statements instead of paper statements. Should only be set for patients with an email address and clients with athenaCommunicator. The language we use in the portal is, "Future billing statements will be sent to you securely via your Patient Portal account. You will receive an email notice when new statements are available." This language is not required, but it is given as a suggestion.
    portalaccessgiven: 'false/true - string', // This flag is set if the patient has been given access to the portal. This may be set by the API user if a patient has been given access to the portal "by providing a preprinted brochure or flyer showing the URL where patients can access their Patient Care Summaries." The practiceinfo endpoint can provide the portal URL. While technically allowed, it would be very unusual to set this to false via the API.
    povertylevelcalculated: 'number', // Patient's poverty level (% of the Federal Poverty Level), as calculated from family size, income per pay period, pay period, and state. Typically only valued if client has Federal Poverty Level fields turned on.
    povertylevelfamilysize: 'number', // Patient's family size (used for determining poverty level). Only settable if client has Federal Poverty Level fields turned on.
    povertylevelfamilysizedeclined: 'false/true - string', // Indicates if the patient declined to provide "povertylevelfamilysize". Should be set to Yes if the patient declines.
    povertylevelincomedeclined: 'false/true - string', // Indicates if the patient delcines to provide "povertylevelincomeperpayperiod". Should be set to Yes if the patient declines.
    povertylevelincomepayperiod: 'String', // Patient's pay period (used for determining poverty level). Only settable if client has Federal Poverty Level fields turned on.
    povertylevelincomeperpayperiod: 'int', // Patient's income per specified pay period (used for determining poverty level). Only settable if client has Federal Poverty Level fields turned on.
    povertylevelincomerangedeclined: 'false/true - string', // Indicates whether or not the patient declines to provide an income level (povertylevelcalculated).
    preferredname: 'String', // The patient's preferred name (i.e. nickname).
    preferredpronouns: 'String', // Pronoun this patient uses. This is only available in practices with the appropriate practice settings.
    primarydepartmentid: 'String', // The patient's "current" department. This field is not always set by the practice.
    primaryproviderid: 'String', // The "primary" provider for this patient, if set.
    publichousing: 'String', // Used to identify this patient as living in public housing. Only settable if client has Social Determinant fields turned on.
    race: 'String', // The patient race, using the 2.16.840.1.113883.5.104 codeset. See http://www.hl7.org/implement/standards/fhir/terminologies-v3.html Special case: use "declined" to indicate that the patient declined to answer. Multiple values or a tab-seperated list of codes is acceptable for multiple races for input. The first race will be considered "primary". Note: you must update all values at once if you update any.
    referralsourceid: 'String', // The referral / "how did you hear about us" ID.
    referralsourceother: 'String', // If selecting "other" for referral source, this is the text field that can be filled out.
    registerpatientindepartment: 'false/true - string', // If you use LOOKUPDEPARTMENTID to get the local copy of a patient to update, and if the patient is not currently registered in that department, setting this flag will register a new copy of this patient in that department.
    schoolbasedhealthcenter: 'String', // Used to identify this patient as school-based health center patient. Only settable if client has Social Determinant fields turned on.
    sex: 'String', // Patient's sex (M/F)
    sexualorientation: 'String', // Sexual orientation of this patient. This is only available in practices with the appropriate practice settings.
    ssn: 'String',
    state: 'String', // Patient's state (2 letter abbreviation)
    status: 'String', // The "status" of the patient, either active or prospective
    suffix: 'String', // Patient's name suffix
    veteran: 'String', // Used to identify this patient as a veteran. Only settable if client has Social Determinant fields turned on.
    workphone: 'String', // The patient's work phone number. Generally not used to contact a patient. Invalid numbers in a GET will be ignored. Patient phone numbers and other data may change, and one phone number may be associated with multiple patients. You are responsible for taking additional steps to verify patient identity and for using this data in accordance with applicable law, including HIPAA. Only phone numbers that exist in the North American Naming Plan (NANP) are acceptable for input.
    zip: 'String' // Patient's zip. Matching occurs on first 5 characters.
};
