/// <reference path="../typings/tsd.d.ts" />

import q = require('q');

import mS = require('./model.subscriber');
import mV = require('./model.vimtip');
import mails = require('./mails')

export function sendRandomTipToAllSubscribers() {
    randomTip.getRandomTip().then(getAllSubscribersAndSendTip)
}

export function sendRandomTipToNewSubscriber(subscriber: mS.ISubscriber) {
    randomTip.getRandomTip().then(tip => {
        sendTipToSubscriber(tip, subscriber);    
    })
}

function getAllSubscribersAndSendTip(tip: mV.IVimTip) {
    var query = mS.Subscriber.find({recievedLastTip: {$lt: today()}}).limit(process.env.SENDMAIL_LIMIT || 200);
    query.exec((err, res: mS.ISubscriber[]) => {
        if (!err) {
            safelySendAllMails(res, tip);
        } else {
            console.log('Error getting a list of subscribers, trying later again: ' + err);
            setTimeout(() => {getAllSubscribersAndSendTip(tip)}, 5000);
        }
    });                    
}

function safelySendAllMails(items: mS.ISubscriber[], tip: mV.IVimTip) {
    var subscriber = items.pop();

    if (subscriber) {
        sendTipToSubscriber(tip, subscriber);
        setTimeout(() => {
            safelySendAllMails(items, tip);    
        }, 100);
    }
}

function sendTipToSubscriber(tip: mV.IVimTip, subscriber: mS.ISubscriber) {
    mails.sendMailPerserving(subscriber.email, tip.title, tip.getMailText(subscriber.unsubscribeUrl));
    
    subscriber.recievedLastTip = new Date();
    subscriber.recievedNumberOfTips++;
    subscriber.save();

    tip.numberOfTimesSent++;
    tip.lastTimeSent = new Date();
    tip.save();
}

function reallySafeSubscriber(subscriber: mS.ISubscriber) {
    subscriber.save((err, res) => {
        if (err) {
            console.log('Error saving updated subscriber, trying later again: ' + err);
            setTimeout(() => {reallySafeSubscriber(subscriber)}, 5000);
        }
    })      
}

function today(): Date {
    var today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

class RandomTip {
    private tip: mV.IVimTip = null;
    private collectedAt: Date = null;
    private gettingNewTip: boolean = false;
    private getRandomTipPromise: q.Deferred<mV.IVimTip> = null;

    constructor() {
        this.initNewTip();
    }

    public getRandomTip(): q.Promise<mV.IVimTip> {
        console.log('Asking for random tip');
        if (!this.isTipUpToDate()) {
            this.initNewTip();
        }

        return this.getRandomTipPromise.promise;
    }    

    private initNewTip() {
        if (!this.gettingNewTip) {
            console.log('Getting new random tip');
            this.gettingNewTip = true;
            this.getRandomTipPromise = q.defer<mV.IVimTip>();
            this.runMongooseQueryToGetNewTip();
        }
    }

    private runMongooseQueryToGetNewTip() {
        var query = mV.VimTip.find({}).sort({lastTimeSent: 1, random: 1}).limit(1);
        query.exec((err, res: mV.IVimTip[]) => this.initNewTipCb(err, res[0]));                    
    }

    private initNewTipCb(err: any, newTip: mV.IVimTip) {
        if (!err) {
            this.tip = newTip;
            this.collectedAt = new Date();
            this.gettingNewTip = false;
            this.getRandomTipPromise.resolve(newTip);
        } else {
            console.log('Error getting a new random tip, trying later again: ' + err);
            setTimeout(() => {this.runMongooseQueryToGetNewTip()}, 5000);
        }
    }

    private isTipUpToDate(): boolean {
        var today = new Date();

        return this.collectedAt && (today.getDate() == this.collectedAt.getDate());
    }
}
var randomTip = new RandomTip();