const express = require('express')
const helpers = require('./_helpers')
const db = require('./models') // 引入資料庫
const passport = require('./config/passport')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')

app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers: require('./config/handlebars-helper') }))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.user = helpers.getUser(req)
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

require('./routes')(app, passport) // 教材U16表示需要放在 app.js 的最後一行，因為按照由上而下的順序，當主程式把 app (也就是 express() ) 傳入路由時，程式中間做的樣板引擎設定、伺服器設定，也要一併透過 app 變數傳進去？

module.exports = app
