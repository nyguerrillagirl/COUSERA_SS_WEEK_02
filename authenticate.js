var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

// Configure passport
// This assumes that the (username, password) is added in the body as JSON
exports.local = passport.use(new LocalStrategy(User.authenticate()));

// Since we are still using sessions - we will need to specify
// Actually handled by the user model plugin (MAGIC!)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
