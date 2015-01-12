/// <reference path="../typings/tsd.d.ts" />

import express = require('express');
import path = require('path');
import logger = require('morgan');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import errorHandler = require('errorhandler')
var favicon = require('serve-favicon');
var CronJob = require('cron').CronJob;

import website = require('./routes');
import subscriptions = require('subscriptions');

var app = express();

// view engine setup

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', website.router);

/// redirect all invalid urls back to index
app.use((req, res) => {
  res.redirect('/');
});

/// error handlers
app.use(errorHandler());

export = app;

var job = new CronJob('00 30 */2 * * *', function() {
    subscriptions.sendRandomTipToAllSubscribers();
}, function() {
    console.log('send mail service completed at ' + new Date());   
}, true);