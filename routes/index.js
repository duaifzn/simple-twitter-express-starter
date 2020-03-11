const adminController = require('../controllers/adminController.js')

module.exports = app => {
  // /main
  app.get('/', (req, res) => { res.redirect('/tweets') })
  // admin
  app.get('/admin', (req, res) => res.redirect('/admin/users'))
  app.get('/admin/users', adminController.getUsers)
  // tweets
  app.get('/tweets', (req, res) => { res.render('tweets') })
}
