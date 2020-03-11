const express = require('express')
const helpers = require('./_helpers');

const app = express()
const port = 3000
const db = require('./models')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set("view engine", "handlebars")



// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()
app.use(bodyParser.urlencoded({ extended: true }))

require('./routes')(app)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
