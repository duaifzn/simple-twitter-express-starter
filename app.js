const express = require('express')
const helpers = require('./_helpers');
const passport = require('./config/passport')
const app = express()
const port = 3000
const db = require('./models')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')

app.use(methodOverride('_method'))
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set("view engine", "handlebars")
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))


app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()
app.use(bodyParser.urlencoded({ extended: true }))

require('./routes')(app, passport)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
