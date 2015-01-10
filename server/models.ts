/// <reference path="../typings/tsd.d.ts" />

import mongoose = require('mongoose')

export var dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vimfika';
export var dbConnection = mongoose.createConnection(dbUri);

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
    unsubscribed: {
        type: Boolean,
        default: false,
        required: true
    },
    unsubscribedAt: Date
});

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
    }
});

(<any>SubscriberSchema).methods.sendConfirmationMail = function(cb: (err) => void) {
    var s = <ISubscriber>this;
    var token = new Token({subscriber: s._id, allowedAction: 'confirmation'});

    token.save((err, res: IToken) => {
        if (!err) {
            // send mail
            console.log(res._id);
            cb(null);
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

export interface IToken extends mongoose.Document {
    timestamp?: Date;
    subscriber?: any;
    allowedAction?: string;
    active?: boolean;
    used?: boolean;
}

export var Subscriber = dbConnection.model<ISubscriber>("Subscriber", SubscriberSchema, "subscribers");
export var Token = dbConnection.model<IToken>("Token", TokenSchema, "tokens");