/// <reference path="../typings/tsd.d.ts" />

import mongoose = require('mongoose');
import config = require('./model.config');

export var VimTipSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    baseUrl: { 
        type: String, 
        required: true 
    },
    url: { 
        type: String, 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    importedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    numberOfTimesSent: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    random: {
        type: Number,
        required: true,
        default: Math.random
    },
    lastTimeSent: Date
}, {strict: false});

VimTipSchema.index({baseUrl: 1, url: 1}, {unique: true});
VimTipSchema.index({lastTimeSent: 1, random: 1})

VimTipSchema.virtual('fullUrl').get(function() {
    var vt = <IVimTip>this;

    if (isFullUrl(vt.url)) {
        return vt.url;
    } else {
        return vt.baseUrl + vt.url;
    }
});

export interface IVimTip extends mongoose.Document {
    title?: string;
    baseUrl?: string;
    url?: string;
    fullUrl?: string;
    text?: string;
    importedAt?: Date;
    numberOfTimesSent?: number;
    random?: number;
    lastTimeSent?: Date;
}

export var VimTip = config.dbConnection.model<IVimTip>("VimTip", VimTipSchema, "vimtips");

function isFullUrl(url: string) {
    url = url.toLowerCase();
    // starts either with http:// or https://
    return url.indexOf('http://') == 0 || url.indexOf('https://') == 0;
}