/// <reference path="../typings/tsd.d.ts" />

import express = require( 'express');
import models = require('./models');

export var router = express.Router();


// GET home page.
router.get('/', (req, res) => {
  res.render('index', getViewObject());
});

router.post('/signup', (req, res) => {
    var subscriber = new models.Subscriber(req.body);

    subscriber.validate((err) => {
        if (!err) {
            subscriber.save(sendConfirmationMailOrHandleSaveErrors(subscriber.email, res));
        } else {
            showError(res, err);
        }
    });
});

function sendConfirmationMailOrHandleSaveErrors(email: string, res: express.Response) {
    return ((error, subscriber: models.ISubscriber) => {
        if (!error) {
            subscriber.sendConfirmationMail((err) => {
                if (!err) {
                    res.render('confirmationSent', getViewObject({subscriber: subscriber}));
                } else {
                    showError(res, err); 
                }
            });
        } else {
            showErrorOrResignup(email, res, error);
        }
    });
}

function showErrorOrResignup(email: string, res: express.Response, error: any) {
    if (isUniqueKeyConstraint(error)) {
        models.Subscriber.findOne({email: email}, (err, subscriber) => {
            if (!err) {
                if (subscriber.confirmed) {
                    return res.render('index', 
                        getViewObject({success: 'You are already subscribed for a daily fika with Vim tips.'}));
                } else {
                    subscriber.unsubscribed = false;
                    subscriber.unsubscribedAt = null;
                    subscriber.save(sendConfirmationMailOrHandleSaveErrors(email, res));
                }
            } else {
                showError(res, error);
            }
        });
    } else {
        showError(res, error);
    }
}

function showError(res: express.Response, err: any) {
    console.log(err);
    res.render('index', getViewObject({error: err}));
}

function getViewObject(data?: any): any {
    if (!data) { data = {} };
    data.title = 'VimFika'
    return data;
}

function isUniqueKeyConstraint(error: any) {
    return error && error.name == 'MongoError' && error.code == 11000;
}

