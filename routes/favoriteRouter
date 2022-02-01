const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');
const e = require('express');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {  res.sendStatus(200)})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    console.log("favorites ===> ", req.user);
    Favorites.find({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
   
 })
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    console.log("===> POST /favorites invoked.");
    Favorites.find({user:req.user._id})
        .then((userFavorites) => {
            if (userFavorites && !userFavorites.length) {
                console.log("===> POST /favorite - no favorites for user yet.");
                // This user does not have favorites yet
                let dishList = [];
                let userProvidedDishList = req.body;
                for (let i=0; i < userProvidedDishList.length; i++) {
                    console.log("dishItem: ", userProvidedDishList[i]);
                    dishList.push(userProvidedDishList[i]._id);
                }
                let favoriteItem = {user: req.user._id, dishes:dishList};
                Favorites.create(favoriteItem)
                    .then((favorite) => {
                        console.log('Favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);   
                    }, (err) => next(err))
                    .catch( (err) => next(err));                  
            } else {
                console.log("===> POST /favorite - favorites for user found.");
                let favoriteEntry = userFavorites[0]; // get the single entry for user
                let dishList = favoriteEntry.dishes;
                let userProvidedDishList = req.body;
                // For each new dishId provided - if in dishList - skip it, otherwise add
                for (let i=0; i < userProvidedDishList.length; i++) {
                    let newDishItem = userProvidedDishList[i]._id;
                    if (dishList.indexOf(newDishItem) === -1) {
                        // add this item to the dishList
                        dishList.push(newDishItem);
                    }
                }
                // Now let's update the favorites for this user in the db
                favoriteEntry.dishes = dishList;
                favoriteEntry.save()
                    .then( (favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);          
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
         }, (err) => next(err))
        .catch((err) => next(err));
   
 })
.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // Leaders.remove({})
    // .then((resp) => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'application/json');
    //     res.json(resp);
    // }, (err) => next(err))
    // .catch((err) => next(err));    
    res.statusCode = 403;
    res.end('DELETE operation not implement yet on /favorites');

});


// Working on a specific promotion
favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)})
.get(cors.cors,(req, res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+ req.params.dishId);

})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res,next) => {
    // Check if user has any entries (so we can create and/or add to)
    console.log("POST /dishId ===>", req.params.dishId);
    Favorites.find({user:req.user._id})
    .then( (userFavorites) => {
        console.log("POST favorites/dishId ==>", userFavorites);
        if (userFavorites && !userFavorites.length) {
            console.log("POST /favorites/dishId ===> user does not have any favorites yet");
            favoriteItem = {user: req.user._id, dishes:[req.params.dishId]};
            Favorites.create(favoriteItem)
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);   
            }, (err) => next(err))
            .catch( (err) => next(err));
        } else {
            console.log("POST /favorites/dishId ===> user has a current list of favorite");
            var favoriteEntry = userFavorites[0]; // since always returned in a list
            var newDishId = req.params.dishId;

            // Find out if the newDishId is already a favorite or not
            var dishList = favoriteEntry.dishes;
            if (dishList.indexOf(newDishId) == -1) {
                console.log("===> POST /favorites/dishId - this is a new favorite!");
                dishList.push(newDishId);
                favoriteEntry.dishes = dishList;
                favoriteEntry.save()
                    .then( (favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);          
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                console.log("===> POST /favorites/dishId - already a favorite!");
                err = new Error('Dish ' + req.params.dishId + ' already a favorite dish.');
                err.status = 400;
                return next(err);          
            }
         }

    }, (err) => next(err))
    .catch((err) => next(err));  
 })
.put(cors.corsWithOptions,authenticate.verifyUser, (req, res,next) => {
    // Leaders.findByIdAndUpdate(req.params.leaderId, {
    //     $set: req.body
    // }, { new: true })
    // .then((leader) => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'application/json');
    //     res.json(leader);
    // }, (err) => next(err))
    // .catch((err) => next(err));
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);

})
.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res,next) => {
    Favorites.find({user:req.user._id})
        .then((userFavorites) => {
            console.log("==> DELETE favorites/dishId processing ...", userFavorites);
            if (userFavorites && !userFavorites.length) {
                console.log("==> DELETE favorites/dishId no favorites found. Delete in error.");
                err = new Error('Dish ' + req.params.dishId + ' not found as favorite dish.');
                err.status = 404; // not found (even if vacuously true)
                return next(err);          
            } else {
                var dishIdToDelete = req.params.dishId;
                // Find the dish in the list
                console.log("==> DELETE favorites/dishId looking for dishId", dishIdToDelete);
                var favoriteEntry = userFavorites[0]; // since always returned in a list
                var dishList = favoriteEntry.dishes;
                var dishLocation = dishList.indexOf(dishIdToDelete);
                if (dishLocation == -1) {
                    console.log("==> DELETE favorites/dishId not found.");
                    err = new Error('Dish ' + req.params.dishId + ' not found as favorite dish.');
                    err.status = 404; // not found in current list
                    return next(err);          
                } else {
                    // OK we know it is in the dish list
                    dishList.splice(dishLocation, 1);
                    favoriteEntry.dishes = dishList;
                    favoriteEntry.save()
                        .then( (favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        }, (err) => next(err));
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});

module.exports = favoriteRouter;
