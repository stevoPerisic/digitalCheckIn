#!/usr/bin/env nodejs

//	  Copyright 2014 athenahealth, Inc.
//
//	 Licensed under the Apache License, Version 2.0 (the "License"); you
//	 may not use this file except in compliance with the License.  You
//	 may obtain a copy of the License at
//
//		 http://www.apache.org/licenses/LICENSE-2.0
//
//	 Unless required by applicable law or agreed to in writing, software
//	 distributed under the License is distributed on an "AS IS" BASIS,
//	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
//	 implied.  See the License for the specific language governing
//	 permissions and limitations under the License.


// ************************************************************
// TO REGISTER THE APP WITH ATHENA GO HERE:
// https://www.athenahealth.com/more-disruption-please/partner.
// ************************************************************


var events = require('events');
var https = require('https');
var querystring = require('querystring');

var key = 'dcxt88kxxv8kw5hg75h5wy5f'; //dcxt88kxxv8kw5hg75h5wy5f
var secret = 'Y2Zb17Cjt83FFDyq'; // Y2Zb17Cjt83FFDyq
var version = 'preview1';
var practiceid = 195900;

var auth_prefixes = {
    v1: '/oauth',
    preview1: '/oauthpreview',
    openpreview1: '/oauthopenpreview'
};

// This is a useful function to have
function path_join() {
    // trim slashes from arguments, prefix a slash to the beginning of each, re-join (ignores empty parameters)
    var args = Array.prototype.slice.call(arguments, 0)
    var nonempty = args.filter(function (arg, idx, arr) {
        return typeof(arg) != 'undefined'
    });
    var trimmed = nonempty.map(function (arg, idx, arr) {
        var str = String(arg).replace(new RegExp('^/+|/+$'), '');

        if(str.indexOf('?') < 0){
            str = '/' + str;
        }
        return str;
    });

    // console.log(trimmed);

    return trimmed.join('')
};

// Since we want these functions to run in a set order, we need a way to signal for the next one.
var signal = new events.EventEmitter;

// We need to save the token in an outer scope, because of callbacks.
var token;

function authentication() {
    var req = https.request({
        // Set up the request, making sure the content-type header is set. Let the https library do
        // the auth header (including base64 encoding) for us.
        hostname: 'api.athenahealth.com',
        method: 'POST',
        path: path_join(auth_prefixes[version], '/token'),
        auth: key + ':' + secret,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
    }, function (response) {
        response.setEncoding('utf8')
        var content = ''
        response.on('data', function (chunk) {
            content += chunk
        });
        response.on('end', function () {
            var authorization = JSON.parse(content);
            // Save the token!
            token = authorization.access_token;
            console.log(token);
            signal.emit('next');
        });
    });

    req.on('error', function (e) {
        console.log(e.message);
    });

    // The one parameter required for OAuth
    req.write(querystring.stringify({grant_type: 'client_credentials'}))
    req.end()
}

function practiceInfo() {
    // Create and encode parameters
    var parameters = {
        limit: '',
        offset: ''
    };
    var query = '?' + querystring.stringify(parameters);
    console.log('Path:');
    console.log(path_join(version, practiceid, '/practiceinfo', query));
    var req = https.request({
        hostname: 'api.athenahealth.com',
        method: 'GET',
        // path: path_join(version, practiceid, '/practiceinfo', query),
        //
        // We have to check if there are any parameters and if they are empty we do not pass them to the path!
        //
        path: path_join(version, practiceid, '/practiceinfo'),
        // We set the auth header ourselves this time, because we have a token now.
        headers: {'authorization': 'Bearer ' + token}
    }, function (response) {
        response.setEncoding('utf8');
        var content = '';
        response.on('data', function (chunk) {
            content += chunk
        });
        response.on('end', function () {
            console.log('Practice Info:');
            console.log(JSON.parse(content));
            signal.emit('next');
        });
    });

    req.on('error', function (e) {
        console.log(e.message);
    });

    req.end();
}

function getBookedAppts() {
    var parameters = {
        appointmentstatus: 'f',
        departmentid: 1,
        enddate: '04/29/2017',
        ignorerestrictions: 'false',
        showcancelled: 'false',
        showclaimdetail: 'false',
        showcopay: 'false',
        showexpectedprocedurecodes: 'false',
        showinsurance: 'false',
        showpatientdetail: 'false',
        showremindercalldetail: 'false',
        startdate: '04/21/2017'
    };

    var query = '?' + querystring.stringify(parameters);

    console.log('Path:');
    console.log(path_join(version, practiceid, '/appointments/booked', query));

    var req = https.request({
        hostname: 'api.athenahealth.com',
        method: 'GET',
        path: path_join(version, practiceid, '/appointments/booked', query),
        // We set the auth header ourselves this time, because we have a token now.
        headers: {'authorization': 'Bearer ' + token}
    }, function (response) {
        response.setEncoding('utf8');
        var content = '';
        response.on('data', function (chunk) {
            content += chunk;
        });
        response.on('end', function () {
            console.log('Booked appointments:');
            console.log(JSON.parse(content));
            signal.emit('next');
        });
    });
    req.on('error', function (e) {
        console.log(e.message);
    });

    req.end();
}

function departments() {
    // Create and encode parameters
    var parameters = {
        limit: 1,
        providerlist: false,
        showalldepartments: false
    };
    var query = '?' + querystring.stringify(parameters);

    console.log('Path:');
    console.log(path_join(version, practiceid, '/departments', query));

    var req = https.request({
        hostname: 'api.athenahealth.com',
        method: 'GET',
        path: path_join(version, practiceid, '/departments', query),
        // We set the auth header ourselves this time, because we have a token now.
        headers: {'authorization': 'Bearer ' + token}
    }, function (response) {
        response.setEncoding('utf8');
        var content = '';
        response.on('data', function (chunk) {
            content += chunk;
        });
        response.on('end', function () {
            console.log('Department:');
            console.log(JSON.parse(content));
            signal.emit('next');
        });
    });
    req.on('error', function (e) {
        console.log(e.message)
    });

    req.end();
}

function notes() {
    var parameters = {
        notetext: 'Javascript says hi!'
    };
    var content = querystring.stringify(parameters);

    console.log('Path:');
    console.log(path_join(version, practiceid, '/appointments/1/notes', content));

    var req = https.request({
        hostname: 'api.athenahealth.com',
        method: 'POST',
        path: path_join(version, practiceid, '/appointments/733650/notes'),
        headers: {
            'authorization': 'Bearer ' + token,
            'content-type': 'application/x-www-form-urlencoded',
            'content-length': content.length // apparently we have to set this ourselves when using
                                              // application/x-www-form-urlencoded
        }
    }, function (response) {
        response.setEncoding('utf8');
        var content = '';
        response.on('data', function (chunk) {
            content += chunk
        });
        response.on('end', function () {
            console.log('Note posted:');
            console.log(JSON.parse(content));
            signal.emit('next');
        });
    });
    req.on('error', function (e) {
        console.log(e.message);
    });

    req.write(content);
    req.end();
}

// This is one way of forcing the call order
function main() {
    var calls = [authentication, practiceInfo, departments, getBookedAppts, notes]
    signal.on('next', function () {
        var nextCall = calls.shift();
        if (nextCall) {
            nextCall();
        }
    });
    signal.emit('next');
}

module.exports = main;
