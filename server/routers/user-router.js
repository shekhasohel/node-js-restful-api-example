var userRouter = require('express').Router();
const bcrypt = require('bcrypt');
var usersData = require('../data/users-data');
var _ = require('lodash');

var users = usersData;
var id = 6;

var updateId = function (req, res, next) {
    console.log(req.body);
    if (!req.body.id) {
        id++;
        req.body.id = id + '';
    }
    next();
};

userRouter.param('id', function (req, res, next, id) {
    var user = _.find(users, {id: id});
    if (user) {
        req.user = user;
        next();
    } else {
        res.json({"error": "Id not found"});
    }
});

userRouter.get('/:id', function (req, res) {
    var user = req.user;
    res.json(user || {});
});

userRouter.post('/', updateId, function (req, res) {
    var user = req.body;

    user.password = generateHash(user.password)

    users.push(user);
    res.status(201).json(user || {});
});

userRouter.post('/login', function (req, res) {
    var user = req.body;

    var passwordHash = generateHash(user.password)

    var user = _.findIndex(users, {email: user.email, password: passwordHash});
    
    res.status(201).json(user || {});
});

userRouter.put('/:id', function (req, res) {
    var update = req.body;

    if (update.id) {
        delete update.id;
    }

    var user = _.findIndex(users, {id: req.params.id});

    if (!users[user]) {
        res.send();
    } else {
        update.password = generateHash(update.password)
        var updatedUser = _.assign(users[user], update);
        res.json(updatedUser);
    }
});

// Error handler
userRouter.use(function (err, req, res, next) {

    if (err) {
        res.status(500).send(err);
    }

});

function generateHash(password) {
    return bcrypt.hashSync(password, 10);
}

module.exports = userRouter;