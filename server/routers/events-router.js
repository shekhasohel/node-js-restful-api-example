var eventsRouter = require('express').Router();
var eventsData = require('../data/events-data');
var _ = require('lodash');

var events = eventsData;
var id = 12;

var updateId = function (req, res, next) {
    console.log(req.body);
    if (!req.body.id) {
        id++;
        req.body.id = id + '';
    }
    next();
};

eventsRouter.param('id', function (req, res, next, id) {
    var event = _.find(events, {id: id});
    if (event) {
        req.event = event;
        next();
    } else {
        res.json({"error": "Id not found"});
    }
});

eventsRouter.get('/', function (req, res) {
    res.json(events);
});

eventsRouter.get('/:id', function (req, res) {
    var event = req.event;
    res.json(event || {});
});

eventsRouter.post('/', updateId, function (req, res) {
    var event = req.body;

    events.push(event);
    res.status(201).json(event || {});
});

eventsRouter.post('/register/:id', function (req, res) {
    var attendee = req.body.attendee;

    var event = _.findIndex(events, {id: req.params.id});

    if (!events[event]) {
        res.send();
    } else {
        events[event].attendees.push(attendee);

        // TODO: run serverless to notify all the attendees of changes to their registered events

        res.json(event);
    }
});

eventsRouter.post('/deregister/:id', function (req, res) {
    var attendee = req.body.attendee;

    var event = _.findIndex(events, {id: req.params.id});

    if (!events[event]) {
        res.send();
    } else {
        var attendeeIndex = events[event].attendees.indexOf(attendee);
        events[event].attendees.splice(attendeeIndex, 1);

        // TODO: run serverless to notify all the attendees of changes to their registered events

        res.json(event);
    }
});

eventsRouter.put('/:id', function (req, res) {
    var update = req.body;

    if (update.id) {
        delete update.id;
    }
    if (update.hostID) {
        delete update.hostID;
    }
    if (update.attendees) {
        delete update.attendees;
    }

    var event = _.findIndex(events, {id: req.params.id});

    if (!events[event]) {
        res.send();
    } else {
        var updatedEvent = _.assign(events[event], update);

        // TODO: run serverless to notify all the attendees of changes to their registered events

        res.json(updatedEvent);
    }
});

eventsRouter.delete('/:id', function (req, res) {
    var event = _.findIndex(events, {id: req.params.id});
    events.splice(event, 1);

    res.json(req.event);
});

// Error handler
eventsRouter.use(function (err, req, res, next) {

    if (err) {
        res.status(500).send(err);
    }

});

module.exports = eventsRouter;