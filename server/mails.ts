/// <reference path="../typings/tsd.d.ts" />

import nodemailer = require('nodemailer');
import util = require('util');

var smtpPool = require('nodemailer-smtp-pool');

var transport = nodemailer.createTransport(smtpPool(getSmtpOptions()));

function getSmtpOptions(): NodemailerSMTPTransportOptions {
    return {
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    };
}

export function sendTip(to: string, tip: any, unsubscribeUrl: string) {
}

export function sendConfirmationMail(to: string, token: string, cb: (err) => void) {
    var mailText = 'Hey, thank you for subscribing to VimFika, to get daily tips about Vim. ' +
                   'Please click on the following link to confirm your subscription: ' +
                   'http://vimfika.logtank.com/confirm/%s' +
                   "\n\nIf you didn't subscribe to VimFika, you can ignore this email.";

    sendMail(to, 'Confirm subscription', util.format(mailText, token), cb);
}

export function sendUnsubscribeMail(to: string, token: string, cb: (err) => void) {
    var mailText = 'Hello, sorry to hear that you chose to unsubscribe from VimFika. ' +
                   'If this is true please click on the following link to confirm it:  ' +
                   'http://vimfika.logtank.com/unsubscribe/confirm/%s' +
                   '\n\nPlease also consider replying to this mail to give me feedback, ' +
                   'why you chose to leave VimFika. Thank you!' +
                   "\n\nIf you didn't choose to unsubscribe from VimFika, you can ignore this email.";

    sendMail(to, 'Confirm unsubscribe', util.format(mailText, token), cb);
}

export function sendMail(to: string, subject: string, text: string, cb:(err) => void) {
    var mail: MailComposer = {
        from: 'VimFika <vimfika@logtank.com>',
        to: to,
        subject: '[VimFika] ' + subject,
        text: text
    };
    transport.sendMail(mail, cb);
}