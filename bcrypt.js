const bcrypt = require('bcrypt')

async function hash(password) {
  const hashedPassword = await bcrypt.hash(password, 10)
  return hashedPassword
}

async function compare(initPassword, dbPassword) {
  return await bcrypt.compare(initPassword, dbPassword)
}

module.exports = { hash, compare }
