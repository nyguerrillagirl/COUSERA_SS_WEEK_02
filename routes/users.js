var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
const cors = require('./cors');

var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,function(req, res, next) {
  User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
});

// The endpoint is /user/signup
router.post('/signup', cors.corsWithOptions,function(req, res, next){
  User.register(
    new User({username: req.body.username}), 
    req.body.password, 
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err:err});
      } else {
        // After registration -> authenticate the user now
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save((err,user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json( {err: err});
            return;
          }
          passport.authenticate('local')(req,res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Registration Successful!'});             
          });
        });
 
      }
    });
  });

  // Add middleware to authenticate first
  router.post('/login', cors.corsWithOptions, passport.authenticate('local'),(req, res) => {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in.'});             
  });
  
// Note: This is a sessions based-logout DOES NOT WORK for JWT  
router.get('/logout', cors.corsWithOptions, (req, res) => {
  if (req.session) {
    // The session exists - let's remove it
    req.session.destroy();
    res.clearCookie('session-id'); 
    // Redirect user to the home page
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in.');
    err.status = 403;
    next(err);
  }
});
// TODO: Get this to work...endpoint not reaced for some reason
router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  console.log("===> hit the right endpoint");
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in.'});             
  }
});

module.exports = router;
