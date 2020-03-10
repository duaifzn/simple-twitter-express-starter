const express = require('express')
const helpers = require('./_helpers')

const app = express()
const port = 3000
const exphbs = require('express-handlebars')
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

require('./routes')(app) // 教材U16表示需要放在 app.js 的最後一行，因為按照由上而下的順序，當主程式把 app (也就是 express() ) 傳入路由時，程式中間做的樣板引擎設定、伺服器設定，也要一併透過 app 變數傳進去？

module.exports = app
