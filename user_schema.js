const mongoose = require("mongoose")
const connection = require("./database")

const user = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    maxLength: 20
  },
  password: {
    type: String,
    required: true,
  },
  rePassword: {
    type: String,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now()
  }
})

const User = connection.model("users", user)
module.exports = User