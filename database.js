const mongoose = require('mongoose')

const connection = mongoose.createConnection('mongodb://localhost:27017/login_system')

module.exports = connection
