const db = require('../models')
const User = db.User

const adminController = {
  getUsers: (req, res) => {
    return User.findAll().then(users => {
      return res.render('admin/users', { users })
    })
  }
}

module.exports = adminController
