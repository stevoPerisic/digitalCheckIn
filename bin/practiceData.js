// var app = require('../app');
//
// function getDepartments() {
//     var params = {
//             providerlist: true,
//             showalldepartments: false
//         },
//         apiCall = app.locals.AHAPI.GET('/departments', {params: params});
//
//     return new Promise(function(resolve, reject){
//         apiCall.on('done', function (data) {
//             if (!data.error && data.departments) {
//                 resolve(parseInt(data.departments[0].departmentid, 10));
//             } else {
//                 reject(data);
//             }
//         });
//     });;
// }
//
// function getAppointments(departmentid) {
//     var today = new Date(),
//         enddate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear(),
//         params = {
//             appointmentstatus: 'f',
//             departmentid: departmentid,
//             enddate: enddate,
//             ignorerestrictions: 'false',
//             showcancelled: 'false',
//             showclaimdetail: 'false',
//             showcopay: 'false',
//             showexpectedprocedurecodes: 'false',
//             showinsurance: 'true',
//             showpatientdetail: 'true',
//             showremindercalldetail: 'false',
//             startdate: '02/20/2017'//\\enddate
//         },
//         apiCall = app.locals.AHAPI.GET('/appointments/booked', {params: params});
//
//     return new Promise(function (resolve, reject) {
//         apiCall.on('done', function (data) {
//             if (!data.error && data.appointments) {
//                 resolve(data.appointments);
//             } else {
//                 reject(data);
//             }
//         });
//     });;
// }
//
// function sortAppointments(appointments) {
//     appointments.sort(function (a, b) {
//         return new Date(b.date) - new Date(a.date);
//     });
//
//     return appointments;
// }
//
// module.exports = {
//     getDepartments: getDepartments,
//     getAppointments: getAppointments,
//     sortAppointments: sortAppointments
// };

module.exports = function (app) {
    var today = new Date();
    var enddate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
    return new Promise(function (resolve, reject) {
        app.locals.AHAPI.GET('/departments', {
            params: {
                providerlist: true,
                showalldepartments: false
            }
        }).on('done', function (data) {
            if (!data.error) {
                /**
                 * Select the first dept and pick it's id to pass down to the appointment middleware
                 * The department ID needs to be an integer and it comes back as a string from this call
                 **/
                // console.log(data.departments);
                app.locals.departmentid = parseInt(data.departments[0].departmentid, 10);
                app.locals.AHAPI.GET('/appointments/booked', {
                    params: {
                        appointmentstatus: 'f',
                        departmentid: app.locals.departmentid,
                        enddate: enddate,
                        ignorerestrictions: 'false',
                        showcancelled: 'false',
                        showclaimdetail: 'false',
                        showcopay: 'false',
                        showexpectedprocedurecodes: 'false',
                        showinsurance: 'true',
                        showpatientdetail: 'true',
                        showremindercalldetail: 'false',
                        startdate: '03/01/2018'//\\enddate
                    }
                }).on('done', function (data) {
                    /**
                     * @todo should be able to handle errors such as
                     * { error: 'Invalid practice.',  detailedmessage: 'The practice ID does not exist.' }
                     **/

                    /** order by date **/
                    console.log(data);
                    if (!data.error) {
                        data.appointments.sort(function (a, b) {
                            return new Date(b.date) - new Date(a.date);
                        });
                        app.locals.appts = data.appointments;
                        app.locals.enddate = enddate;

                        app.locals.AHAPI.GET('/providers', {}).on('done', function (data) {
                            // console.log(data);
                            app.locals.providers = data.providers;

                            resolve({dataLoaded: true});
                        });

                    } else {
                        console.log('Error');
                        console.log(data);
                        reject(data);
                    }

                });
            } else {
                /**
                 * @todo handle error appropriately for the front-end, currently the appt. list just doesn't show
                 **/
                console.log(data.error);
                reject(data);
            }
        });
    });
};