/// <reference path="../typings/tsd.d.ts" />

import express = require('express');

export var router = express.Router();

router.get('/dev/subscribe', (req, res) => {
    res.render('confirmation_sent', getViewObject());
});

router.get('/dev/confirm', (req, res) => {
    res.render('confirmed', getViewObject());
});

router.get('/dev/unsubscribe', (req, res, next) => {
    res.render('unsubscribing', getViewObject());
});

router.get('/dev/unsubscribe_failed', (req, res, next) => {
    res.render('unsubscribe_failed', getViewObject());
});

function getViewObject(data?: any): any {
    if (!data) { data = {} };
    data.title = 'VimFika'
    data.subscriber = { email: 'test@gmail.com', unsubscribeUrl: 'http://vimfika.logtank.com/unsubscribe/test' };
    return data;
}