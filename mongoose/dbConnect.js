const mongoose = require('mongoose')
const UserModel = require('../models/user')
const config = require('../bin/config')

mongoose.connect(config.db.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('db success');
});

module.exports = UserModel