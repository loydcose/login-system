require('dotenv').config()
const mongoose = require('mongoose')

const username = process.env.DB_ATLAS_USERNAME
const password = process.env.DB_ATLAS_PASSWORD
const cluster = process.env.DB_ATLAS_CLUSTER
const dbname = process.env.DB_ATLAS_NAME

const uri = `mongodb+srv://${username}:${password}@${cluster}.gcccj.mongodb.net/${dbname}?retryWrites=true&w=majority`

const connection = mongoose.createConnection(uri)

module.exports = connection
