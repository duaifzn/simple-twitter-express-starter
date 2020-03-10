const db = require('../models')
const User = db.User

const adminController = {
  getUsers: (req, res) => {
    res.render('admin/users')
  }
}

module.exports = adminController
