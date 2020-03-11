const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const adminController = {
  adminHomePage: (req, res) => {
    return Tweet.findAll().then(tweets => {
      return res.render('admin/tweets', { tweets })
    })
  },

  deleteTweet: (req, res) => {

  },

  adminUserPage: (req, res) => {
    return User.findAll().then(users => {
      return res.render('admin/users', { users })
    })
  }
}
module.exports = adminController
