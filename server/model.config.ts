/// <reference path="../typings/tsd.d.ts" />

import mongoose = require('mongoose');

export var dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vimfika';
export var dbConnection = mongoose.createConnection(dbUri);

export function isUniqueKeyConstraint(error: any) {
    return error && error.name == 'MongoError' && error.code == 11000;
}