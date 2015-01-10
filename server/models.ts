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
        require: true
    },
    confirmed: {
        type: Boolean,
        default: false,
        required: true
    },
    confirmedAt: Date
});

(<any>SubscriberSchema).methods.sendConfirmationMail = () => {

}

export interface ISubscriber extends mongoose.Document {
    email: string;
    subscribedAt?: Date;
    confirmed?: boolean;
    confirmedAt?: Date;

    sendConfirmationMail();
}

export var Subscriber = dbConnection.model<ISubscriber>("Subscriber", SubscriberSchema, "subscribers");