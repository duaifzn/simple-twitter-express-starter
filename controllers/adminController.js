const db = require('../models')
const User = db.User

const adminController = {
  getUsers: (req, res) => {
    return User.findAll().then(users => {
      return res.render('admin/users', { users })
    })
  },

  adminHomePage: (req, res) => {
    res.redirect('/tweets')
  },

  deleteTweet: (req, res) => {

  },
  adminUserPage: (req, res) => {

  }
}
module.exports = adminController
