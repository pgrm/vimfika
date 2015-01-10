/// <reference path="../typings/tsd.d.ts" />

import express = require( 'express');
import models = require('./models');

export var router = express.Router();

function getViewObject(data?: any): any {
    if (!data) { data = {} };
    data.title = 'VimFika'
    return data;
}

function showError(res: express.Response, err: any) {
    console.log(err);
    res.render('index', getViewObject({error: err}));
}

// GET home page.
router.get('/', (req, res) => {
  res.render('index', getViewObject());
});

router.post('/signup', (req, res) => {
    var subscriber = new models.Subscriber(req.body);

    subscriber.validate((err) => {
        if (!err) {
            subscriber.save((e, s: models.ISubscriber) => {
                if (!e) {
                    s.sendConfirmationMail();
                    res.render('confirmationSent', getViewObject({subscriber: s}))
                } else {
                    showError(res, e);
                }
            });
        } else {
            showError(res, err);
        }
    });
});

