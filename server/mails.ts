/// <reference path="../typings/tsd.d.ts" />

import nodemailer = require('nodemailer');

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

export function sendConfirmationMail(to: string, token: string, cb: (err) => void) {
    var mailOptions: MailComposer = {
        from: 'vimfika@logtank.com',
        to: to,
        subject: '[VimFika] Confirm subscription',
        text: token.toString()
    };
    console.log(getSmtpOptions());
    console.log("before sending");
    transport.sendMail(mailOptions, cb);
    console.log("after sending started");
}