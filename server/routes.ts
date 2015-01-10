/// <reference path="../typings/tsd.d.ts" />

import express = require('express');
import mS = require('./model.subscriber');
import mT = require('./model.token');

export var router = express.Router();


// GET home page.
router.get('/', (req, res) => {
  res.render('index', getViewObject());
});

router.post('/signup', (req, res) => {
    var subscriber = new mS.Subscriber(req.body);

    subscriber.validate((err) => {
        if (!err) {
            subscriber.save(mS.sendConfirmationMailOrHandleSaveErrors(subscriber.email, res));
        } else {
            showError(res, err);
        }
    });
});

router.get('/confirm/:token', (req, res, next) => {
    mT.Token.findById(req.params.token, (error, token) => {
        if (!error && token.isValidFor('confirmation')) {
            token.confirmSubscriber((err, subscriber) => {
                if (!err) {
                    res.render('confirmed', getViewObject({subscriber: subscriber}))
                } else {
                    showError(res, err, 'Confirmation failed, please try signing up again.');
                }
            });
        } else {
            if (!error) {
                res.statusCode = 400;
                error = new Error("This URL isn't valid anymore.")
            }
            next(error);
        }
    });
});

export function showError(res: express.Response, err: any, errTitle: string = 'Error subscribing!') {
    console.log(err);
    res.render('index', getViewObject({error: err, errorTitle: errTitle}));
}

export function getViewObject(data?: any): any {
    if (!data) { data = {} };
    data.title = 'VimFika'
    return data;
}