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
    var user = Object.assign({}, req.user);
    delete user.password;
    res.json(user || {});
});

userRouter.post('/', updateId, function (req, res) {
    var user = req.body;

    user.password = generateHash(user.password)

    users.push(user);

    var userData = Object.assign({}, user);
    delete userData.password;
    res.status(201).json(userData || {});
});

userRouter.post('/login', function (req, res) {

    var passwordHash = generateHash(req.body.password)

    var user = _.findIndex(users, {'email': req.body.email});

    if (!users[user]) {
        res.send();
    } else {
        var userData = Object.assign({}, users[user]);
        if (!compareHash(req.body.password, userData.password)) {
            res.send();
        } else {
            delete userData.password;
            res.json(userData);
        }
    }
});

userRouter.put('/:id', function (req, res) {
    var update = req.body;
    var user = _.findIndex(users, {id: req.params.id});

    if (!users[user]) {
        res.send();
    } else {
        if (update.id) {
            delete update.id;
        }
        if (update.email) {
            delete update.email;
        }
        update.password = generateHash(update.password)
        _.assign(users[user], update);
        var updatedUser = Object.assign({}, users[user]);
        delete updatedUser.password;
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

function compareHash(password, hash) {
    return bcrypt.compareSync(password, hash)
}

module.exports = userRouter;