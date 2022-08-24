const User = require('./user_schema')
const express = require('express')
const { ObjectId } = require('mongodb')
const methodOverride = require('method-override')
const { hash, compare } = require("./bcrypt")
const app = express()

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      var method = req.body._method
      delete req.body._method
      return method
    }
  })
)

let isLogged = false
let userObj = null

// login page
app.get('/login', (req, res) => {
  isLogged = false
  res.render('login', {
    title: 'LOGIN PAGE',
    rePasswordLabel: '',
    rePasswordType: 'hidden',
    rePasswordID: '',
    switchMessage: 'Signup',
    switchMessageRoute: '/signup',
    actionRoute: '/login',
  })
})

// POST login
app.post('/login', (req, res) => {
  User.findOne({ username: req.body.username }).then((result) => {
    if (result === null) {
      return res.send("No account exist!<br><a href='/login'>Login again</a>")
    }

    compare(req.body.password, result.password).then((isMatched) => {
      if (isMatched) {
        userObj = result
        res.redirect('/home')
      } else {
        res.send("Wrong password!<br><a href='/login'>Login again</a>")
      }
    })
  })
})

// signup page
app.get('/signup', (req, res) => {
  isLogged = false
  res.render('signup', {
    title: 'SIGNUP PAGE',
    rePasswordLabel: 'Re-enter password',
    rePasswordType: 'password',
    rePasswordID: 'rePassword',
    switchMessage: 'Login',
    switchMessageRoute: '/login',
    actionRoute: '/signup',
  })
})

// POST signup
app.post('/signup', (req, res) => {
  if (req.body.password !== req.body.rePassword) {
    return res.send("Password didn't matched!<br><a href='/signup'>Back to signup</a>")
  }

  hash(req.body.password)
    .then((result) => {
      const reqObj = {
        username: req.body.username.trim(),
        password: result,
      }
      return User.insertMany([reqObj])
    })
    .then((result) => {
      console.log(result)
      res.send("Account created!<br><a href='/login'>Go to login</a>")
    })
    .catch((err) => {
      console.log(err)
      res.send(`Validation failed, or username already taken!<br><a href='/signup'>Back to signup</a>`)
    })

  // username = alphabet and numbers
  // password = alphabet, numbers and special chars
  // hashed password
})


// GET home
app.get('/home', (req, res) => {
  if (userObj === null) {
    return res.send("Session expired!<br><a href='/login'>Back to login</a>")
  }

  isLogged = true

  res.render('home', {
    title: 'homepage',
    username: userObj.username,
    accountId: userObj._id.toString(),
  })

  // userObj back to null pls
})

// GET change username page
app.get('/changeUsername/:id', (req, res) => {
  if (!isLogged) return res.send("You are not logged in yet!<br><a href='/login'>Back to login</a>")

  User.findOne({ _id: ObjectId(req.params.id) }).then((result) => {
    res.render('change_username', {
      title: 'Change username',
      accountId: req.params.id,
      username: result.username,
    })
  })
})

// UPDATE username
app.put('/changeUsername/:id', (req, res) => {
  User.findOne({ _id: ObjectId(req.params.id) }).then((result) => {
    if (req.body.password !== result.password) {
      return res.send("Password are incorrect!<br><a href='/home'>Back to home</a>")
    }

    User.exists({ username: req.body.username.trim() })
      .then((result) => {
        if (result) {
          res.send("Username already exists<br><a href='/home'>Back to home</a>")
        } else {
          return User.updateOne({ _id: ObjectId(userObj._id.toString()) }, { $set: { username: req.body.username.trim() } })
        }
      })
      .then((result) => {
        userObj = null
        res.send("Changed!<br><a href='/login'>Back to login</a>")
      })

    // fixed every time login
    // apply routes
    // change pass
    // delete account
  })
})

// GET change password page
app.get('/changePassword/:id', (req, res) => {
  if (!isLogged) return res.send("You are not logged in yet!<br><a href='/login'>Back to login</a>")

  res.render('change_password', {
    title: 'Change password',
    accountId: req.params.id,
  })
})

// UPDATE password
app.put('/changePassword/:id', (req, res) => {
  // check if password were matched
  // check if password was right
  const { newPassword, reNewPassword, password } = req.body

  if (newPassword !== reNewPassword) {
    return res.send("Password didn't matched!<br><a href='/home'>Back to home</a>")
  }

  User.findOne({ _id: ObjectId(req.params.id) }).then((result) => {
    if (req.body.password !== result.password) {
      res.send("Password were incorrect!<br><a href='/home'>Back to home</a>")
    } else {
      User.updateOne({ _id: ObjectId(req.params.id) }, { $set: { password: req.body.newPassword } }).then((result) => {
        console.log(result)
        res.send("Password changed!<br><a href='/login'>Back to login</a>")
      })
    }
  })

  // fix re password on db
})

// GET delete account page
app.get('/deleteAccount/:id', (req, res) => {
  if (!isLogged) return res.send("You are not logged in yet!<br><a href='/login'>Back to login</a>")
  res.render('delete_account', { title: 'Account deletion', accountId: req.params.id })
})

// DELETE account
app.delete('/deleteAccount/:id', (req, res) => {
  User.findOne({ _id: ObjectId(req.params.id) }).then((result) => {
    if (req.body.password !== result.password) {
      res.send("Password were incorrect!<br><a href='/home'>Back to home</a>")
    } else {
      User.deleteOne({ _id: ObjectId(req.params.id) }).then((result) => {
        console.log(result)
        res.send("Account deleted!<br><a href='/login'>Back to login</a>")
      })
    }
  })
})


app.listen(5000, () => {
  console.log('Server started')
})
