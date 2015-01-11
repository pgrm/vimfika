/// <reference path="../typings/tsd.d.ts" />

import express = require('express');
import mS = require('./model.subscriber');
import mT = require('./model.token');

export var router = express.Router();


// GET home page.
router.get('/', (req, res) => {
  res.render('index', getViewObject());
});

router.post('/subscribe', (req, res) => {
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
                    showError(res, err, 'Confirmation failed, please try subscribing again.');
                }
            });
        } else {
            invalidUrlOrServerError(error, res, next);
        }
    });
});

router.get('/unsubscribe/confirm/:token', (req, res, next) => {
    mT.Token.findById(req.params.token, (error, token) => {
        if (!error && token.isValidFor('unsubscribe')) {
            token.confirmUnsubscribe((err, subscriber) => {
                if (!err) {
                    res.render('index', getViewObject({info: 'You have successfully unsubscribed.'}));
                } else {
                    showError(res, err, 'Error unsubscribing!', 'unsubscribe_failed')
                }
            });
        } else {
            invalidUrlOrServerError(error, res, next);     
        }
    });
});

router.get('/unsubscribe/:token/:email', (req, res, next) => {
    mS.Subscriber.findOne({email: req.params.email}, (error, subscriber) => {
        if (!error && subscriber.unsubscribeToken == req.params.token) {
            subscriber.unsubscribe((err) => {
                if (!err) {
                    res.render('unsubscribing', getViewObject({subscriber: subscriber}));
                } else {
                    showError(res, err, 'Error unsubscribing!', 'unsubscribe_failed')
                }
            });
        } else {
            invalidUrlOrServerError(error, res, next);
        }
    })
});

router.get('/testmail', (req, res) => {
    
    res.sendStatus(200);    
})

export function showError(res: express.Response, 
                          err: any, 
                          errTitle: string = 'Error subscribing!', 
                          view: string = 'index') {
    res.render(view, getViewObject({error: err, errorTitle: errTitle}));
}

export function invalidUrlOrServerError(error: any, res: express.Response, next: Function) {
    if (!error) {
        res.statusCode = 400;
        error = new Error("This URL isn't valid anymore.")
    }
    next(error);
}

export function getViewObject(data?: any): any {
    if (!data) { data = {} };
    data.title = 'VimFika'
    return data;
}