const User = require('./user_schema')
const express = require('express')
const { ObjectId } = require('mongodb')
const methodOverride = require('method-override')
const { hash, compare } = require('./bcrypt')
const formatDate = require('./format_date')
const app = express()

const port = process.env.PORT || 5000

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
app.use(express.static('public'))

let isLogged = false
let userObj = null

app.get('/', (req, res) => {
  res.send("Hello!")
})

// GET LOGIN
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

// POST LOGIN
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
    createdAt: formatDate(userObj.createdAt),
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
app.put('/changeUsername/:id', async (req, res) => {
  const userdb = await User.findOne({ _id: ObjectId(req.params.id) })
  const isMatched = await compare(req.body.password, userdb.password)

  if (!isMatched) {
    return res.send("Password are incorrect!<br><a href='/home'>Back to home</a>")
  }

  const isExist = await User.exists({ username: req.body.username.trim() })
  if (isExist) {
    return res.send("Username already exists<br><a href='/home'>Back to home</a>")
  } else {
    await User.updateOne({ _id: ObjectId(userObj._id.toString()) }, { $set: { username: req.body.username.trim() } })
    userObj = null
    res.send("Changed!<br><a href='/login'>Back to login</a>")
  }
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
app.put('/changePassword/:id', async (req, res) => {
  const { newPassword, reNewPassword, password } = req.body

  if (newPassword !== reNewPassword) {
    return res.send("Password didn't matched!<br><a href='/home'>Back to home</a>")
  }

  const userdb = await User.findOne({ _id: ObjectId(req.params.id) })
  const isMatched = await compare(password, userdb.password)

  if (!isMatched) {
    res.send("Password were incorrect!<br><a href='/home'>Back to home</a>")
  } else {
    const newPassword = await hash(reNewPassword)
    await User.updateOne({ _id: ObjectId(req.params.id) }, { $set: { password: newPassword } })
    res.send("Password changed!<br><a href='/login'>Back to login</a>")
  }
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

app.listen(port, () => {
  console.log('Server started')
})

// move to altas database
// learn and use heroku for deployment
// upload on github "Simple login system"
