const adminController = require('../controllers/adminController.js')

module.exports = app => {
  // /main
  app.get('/', (req, res) => { res.send('hello word!') })
  // admin
  app.get('/admin', (req, res) => res.redirect('/admin/users'))
  app.get('/admin/users', adminController.getUsers)
}
