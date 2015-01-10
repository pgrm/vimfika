/// <reference path="../typings/tsd.d.ts" />

import mongoose = require('mongoose');
import express = require('express');
import uuid = require('node-uuid');
import mails = require('./mails');
import config = require('./model.config');
import mT = require('./model.token');
import routes = require('./routes');

var emailRegex = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/;

export var SubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: 'Email address is required',
        trim: true,
        lowercase: true,
        match: [emailRegex, 'Please provide a valid email address'],
        unique: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false,
        required: true
    },
    confirmedAt: Date,
    unsubscribeToken: {
        type: String,
        default: uuid.v4
    },
    unsubscribed: {
        type: Boolean,
        default: false,
        required: true
    },
    unsubscribedAt: Date
});

(<any>SubscriberSchema).methods.sendConfirmationMail = function(cb: (err) => void) {
    var s = <ISubscriber>this;
    var token = new mT.Token({subscriber: s._id, allowedAction: 'confirmation'});

    token.save((err, res: mT.IToken) => {
        if (!err) {
            mails.sendConfirmationMail(s.email, res._id, cb);
        } else {
            cb(err);
        }
    })
}

export interface ISubscriber extends mongoose.Document {
    email: string;
    subscribedAt?: Date;
    confirmed?: boolean;
    confirmedAt?: Date;
    unsubscribed?: boolean;
    unsubscribedAt?: Date;

    sendConfirmationMail(cb: (err) => void);
}

export var Subscriber = config.dbConnection.model<ISubscriber>("Subscriber", SubscriberSchema, "subscribers");

export function sendConfirmationMailOrHandleSaveErrors(email: string, res: express.Response) {
    return ((error, subscriber: ISubscriber) => {
        if (!error) {
            subscriber.sendConfirmationMail((err) => {
                if (!err) {
                    res.render('confirmation_sent', routes.getViewObject({subscriber: subscriber}));
                } else {
                    routes.showError(res, err); 
                }
            });
        } else {
            showErrorOrResignup(email, res, error);
        }
    });
}

export function showErrorOrResignup(email: string, res: express.Response, error: any) {
    if (config.isUniqueKeyConstraint(error)) {
        Subscriber.findOne({email: email}, (err, subscriber) => {
            if (!err) {
                if (subscriber.confirmed) {
                    return res.render('index', 
                        routes.getViewObject({success: 'You are already subscribed for a daily fika with Vim tips.'}));
                } else {
                    subscriber.unsubscribed = false;
                    subscriber.unsubscribedAt = null;
                    subscriber.save(sendConfirmationMailOrHandleSaveErrors(email, res));
                }
            } else {
                routes.showError(res, error);
            }
        });
    } else {
        routes.showError(res, error);
    }
}
