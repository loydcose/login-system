const bcrypt = require("bcrypt")

async function hash(password) {
  // const salt = await bcrypt.genSalt() you don't need this, just append 10 instead of salt
  const hashedPassword = await bcrypt.hash(password, 10)
  return hashedPassword
}

async function compare(initPassword, dbPassword) {
  return await bcrypt.compare(initPassword, dbPassword)
}


module.exports = { hash, compare }