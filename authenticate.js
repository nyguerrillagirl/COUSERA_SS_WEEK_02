var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');

// Configure passport
// This assumes that the (username, password) is added in the body as JSON
exports.local = passport.use(new LocalStrategy(User.authenticate()));

// Since we are still using sessions - we will need to specify
// Actually handled by the user model plugin (MAGIC!)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up the JWT to use our secret and expire in 1 hour = 60 sec/min * 60 min/hour
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));

// Check if user is admin
function verifyAdminUser(req, res, next) {
    console.log("===> verifyAdminUser");
    if (req.isAuthenticated()) {
        if (req.user.admin) {
            return next();
        } else {
            var err = new Error('You are not an admin user');
            err.status = 403;
            return next(err);
        }
    } else {
        var err = new Error('You need to be an authorized user');
        err.status = 403;
        return next(err);
    }
    
}
// We will be creating sessions
exports.verifyUser = passport.authenticate('jwt', { session: false});
exports.verifyAdminUser = verifyAdminUser;
