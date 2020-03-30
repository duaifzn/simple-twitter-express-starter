const express = require('express')
const helpers = require('./_helpers')
const db = require('./models') // 引入資料庫
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')
// var MySQLStore = require('express-mysql-session')(session)
const flash = require('connect-flash')
const path = require('path')

const passport = require('./config/passport') // 或調整順序到dotenv底下，讓 config/passport.js 吃到 .env 裡的設定
const app = express()
const port = process.env.PORT || 3000

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers: require('./config/handlebars-helper') }))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))

// var options = {
//   host: 'us-cdbr-iron-east-01.cleardb.net',
//   user: 'bab924c7b39cda',
//   password: '200dc224',
//   database: 'heroku_ca6ec1a7b6ca2c8'
// };

// var sessionStore = new MySQLStore(options);

// app.use(session({
//   key: 'session_cookie_name',
//   secret: 'session_cookie_secret',
//   store: sessionStore,
//   resave: false,
//   saveUninitialized: false
// }));
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.user = helpers.getUser(req)
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  req.userData = helpers.getUser(req)
  next()
})
// 使用靜態資源訪問,public為根目錄
app.use(express.static(path.join(__dirname, './views/chat')))


require('./routes')(app, passport) // 教材U16表示需要放在 app.js 的最後一行，因為按照由上而下的順序，當主程式把 app (也就是 express() ) 傳入路由時，程式中間做的樣板引擎設定、伺服器設定，也要一併透過 app 變數傳進去？
// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
  console.log(`Enter http://localhost:${port}/ if you run this app on your local computer.`)
})

module.exports = app
