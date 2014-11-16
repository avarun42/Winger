var passport = require('passport');
var WindowsLiveStrategy = require('passport-windowslive').Strategy; //Microsoft
var User = require('../models/User');
var secrets = require('./secrets');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Windows Live profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({
        id: id
    }, function(err, user) {
    done(err, user);
  });
});

passport.use(new WindowsLiveStrategy({
    clientID: secrets.microsoft.clientID,
    clientSecret: secrets.microsoft.clientSecret,
    callbackURL: "http://winger.ngrok.com/auth/windowslive/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({
        id: profile.id 
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        //No user was found... so create a new user with values from Facebook (all the profile. stuff)
        if (!user) {
          console.log(profile.photos[0].value);
            user = new User({
                id: profile.id,
                name: profile.displayName,
                photo: profile.photos[0].value,
                provider: 'microsoft',
                //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                microsoft: profile._json
            });
            user.save(function(err) {
                if (err) console.log(err);
                return done(err, user);
            });
        } else {
            //found user. Return
            return done(err, user);
        }
    });
  }
));

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}
