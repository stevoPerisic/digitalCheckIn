/**
 * Created by stevoperisic on 11/19/18.
 *
 * passport jsonwebtoken strategy
 */

var ExtractJwt = require('passport-jwt').ExtractJwt;
var JwtStrategy = require('passport-jwt').Strategy;


var Applications = {
    users: [
        {
            id: 'NRIM-website', username: 'NRIM', password: process.env.APP_PASS1,
            validPassword: function (pass) {
                return pass === this.password;
            }
        }
    ],
    findById: function (id, fn) {
        var idx = id - 1;
        if (this.users[idx]) {
            fn(null, this.users[idx]);
        } else {
            fn(new Error('User ' + id + ' does not exist'));
        }
    }
};

var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.PASSPORT_JWT_SECRET
};

module.exports = function (passport) {
    passport.use('jwt', new JwtStrategy(jwtOptions,
        function (jwt_payload, next) {
            Applications.findById(jwt_payload.user.id, function (err, user) {

                // if there are any errors, return the error
                if (err) {
                    return next(err);
                }

                // if no user is found, return the message
                if (!user) {
                    return next({'loginMessage': 'No user found.'});
                }

                // if the user is found but the password is wrong
                if (!user.validPassword(jwt_payload.user.password)) {
                    return next({'loginMessage': 'Oops! Wrong password.'});
                }

                // all is well, return successful user
                return next(null, user);
            });
        })
    );
};
