/// <reference path="../typings/tsd.d.ts" />

import mongoose = require('mongoose');
import config = require('./model.config');
import mS = require('./model.subscriber');

export var TokenSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subscriber',
        required: true
    },
    allowedAction: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    used: {
        type: Boolean,
        required: true,
        default: false
    },
    usedAt: Date
}, {strict: false});

export interface IToken extends mongoose.Document {
    timestamp?: Date;
    subscriber?: string;
    allowedAction?: string;
    active?: boolean;
    used?: boolean;
    usedAt?: Date;

    isValidFor(action: string): boolean;
    confirmSubscriber(cb: (error?: any, subscriber?: mS.ISubscriber) => void);
    confirmUnsubscribe(cb: (error?: any, subscriber?: mS.ISubscriber) => void);
}

(<any>TokenSchema).methods.isValidFor = function(action: string) {
    var t = <IToken>this;
    return t.active && !t.used && t.allowedAction == action;
};

(<any>TokenSchema).methods.confirmSubscriber = function(cb: (error?: any, subscriber?: mS.ISubscriber) => void) {
    useToken(<IToken>this, (err, subscriber) => {
        if (!err) {
            if (!subscriber.confirmed) {
                subscriber.confirmed = true;
                subscriber.confirmedAt = new Date();
                subscriber.unsubscribed = false;
                subscriber.save(cb);
            } else {
                cb(null, subscriber);
            }
        } else {
            cb(err);
        }
    });
};

(<any>TokenSchema).methods.confirmUnsubscribe = function(cb: (error?: any, subscriber?: mS.ISubscriber) => void) {
    useToken(<IToken>this, (err, subscriber) => {
        if (!err) {
            if (!subscriber.unsubscribed) {
                subscriber.confirmed = false;
                subscriber.unsubscribed = true;
                subscriber.unsubscribedAt = new Date();
                subscriber.save(cb);
            } else {
                cb(null, subscriber);
            }
        } else {
            cb(err);
        }
    });
};

export var Token = config.dbConnection.model<IToken>("Token", TokenSchema, "tokens");

export function useToken(token: IToken, cb: (error?: any, subscriber?: mS.ISubscriber) => void) {
    mS.Subscriber.findById(token.subscriber, cb);
    token.used = true;
    token.usedAt = new Date();
    token.save();
}