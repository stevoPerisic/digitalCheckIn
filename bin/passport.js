/**
 * Created by stevoperisic on 9/7/17.
 *
 * passport Local Strategy configuration
 */

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
// load up the user model
var User = {
    users: [
        {
            id: 1, username: 'Stevo', password: '5uper5ecretmeg@pa%%word', email: 'stevo@perisicdesigns.com',
            validPassword: function (pass) {
                return pass === this.password;
            }
        },
        {
            id: 2, username: 'Stephanie', password: 'lozink@N@jbolj@', email: 'stephaniefalkoff@gmail.com',
            validPassword: function (pass) {
                return pass === this.password;
            }
        },
        {
            id: 3, username: 'test', password: 'secret', email: 'stevo.perisic@gmail.com',
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
    },
    findByUserEmail: function (email, fn) {
        for (var i = 0, len = this.users.length; i < len; i++) {
            var user = this.users[i];
            if (user.email === email) {
                return fn(null, user);
            }
        }
        return fn(null, null);
    }
};

/**
 * @description passport session set-up
 * - required for persistent login sessions
 * - passport needs ability to serialize and unserialize users out of session
 **/
module.exports = function (passport) {
    /**
     * @description used to serialize the user for the session
     **/
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    /**
     * @description used to deserialize the user
     **/
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    /**
     * @description  LOCAL LOGIN
     * - we are using named strategies since we have one for login and one for signup
     * - by default, if there was no name, it would just be called 'local'
     */
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) {
            console.log('local-login' + email + ' / ' + password);

            process.nextTick(function () {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findByUserEmail(email, function (err, user) {
                    // if there are any errors, return the error
                    if (err) {
                        return done(err);
                    }

                    // if no user is found, return the message
                    if (!user) {
                        // req.flash is the way to set flashdata using connect-flash
                        return done(null, false, req.flash('loginMessage', 'No user found.'));
                    }

                    // if the user is found but the password is wrong
                    if (!user.validPassword(password)) {
                        // create the loginMessage and save it to session as flashdata
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    }

                    // all is well, return successful user
                    return done(null, user);
                });
            });

        })
    );
};