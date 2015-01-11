/// <reference path="../typings/tsd.d.ts" />

import mongoose = require('mongoose');
import config = require('./model.config');

export var VimTipSchema = new mongoose.Schema({
    // email: {
    //     type: String,
    //     required: 'Email address is required',
    //     trim: true,
    //     lowercase: true,
    //     match: [emailRegex, 'Please provide a valid email address'],
    //     unique: true
    // },
    // subscribedAt: {
    //     type: Date,
    //     default: Date.now,
    //     required: true
    // },
    // confirmed: {
    //     type: Boolean,
    //     default: false,
    //     required: true
    // },
    // confirmedAt: Date,
    // unsubscribeToken: {
    //     type: String,
    //     default: uuid.v4,
    //     required: true
    // },
    // unsubscribed: {
    //     type: Boolean,
    //     default: false,
    //     required: true
    // },
    // unsubscribedAt: Date
});

// VimTipSchema.virtual('unsubscribeUrl').get(function() {
//     var s = <IVimTip>this;
//     return 'http://vimfika.logtank.com/unsubscribe/' + s.unsubscribeToken + '/' + s.email;
// });

// (<any>VimTipSchema).methods.sendConfirmationMail = function(cb: (err) => void) {
//     var s = <IVimTip>this;
//     var token = new mT.Token({subscriber: s._id, allowedAction: 'confirmation'});

//     token.save((err, res: mT.IToken) => {
//         if (!err) {
//             mails.sendConfirmationMail(s.email, res._id, cb);
//         } else {
//             cb(err);
//         }
//     });
// };

// (<any>VimTipSchema).methods.unsubscribe = function(cb: (err) => void) {
//     var s = <IVimTip>this;
//     var token = new mT.Token({subscriber: s._id, allowedAction: 'unsubscribe'});

//     token.save((err, res: mT.IToken) => {
//         if (!err) {
//             mails.sendUnsubscribeMail(s.email, res._id, cb);
//         } else {
//             cb(err);
//         }
//     });
// };

export interface IVimTip extends mongoose.Document {
    // email: string;
    // subscribedAt?: Date;
    // confirmed?: boolean;
    // confirmedAt?: Date;
    // unsubscribeToken?: string;
    // unsubscribed?: boolean;
    // unsubscribedAt?: Date;
    // unsubscribeUrl?: string;

    // sendConfirmationMail(cb: (err) => void);
    // unsubscribe(cb: (err) => void);
}

export var VimTip = config.dbConnection.model<IVimTip>("Subscriber", VimTipSchema, "subscribers");