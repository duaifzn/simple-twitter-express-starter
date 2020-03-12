const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const adminController = {
  adminHomePage: (req, res) => {
    return Tweet.findAll().then(tweets => {
      for (let i = 0; i < tweets.length; i++) {
        tweets[i].description = tweets[i].description !== null ? (tweets[i].description.slice(0, 50) + '...') : '' // 只擷取前50字元顯示
      }
      return res.render('admin/tweets', JSON.parse(JSON.stringify({ tweets })))
    })
  },

  deleteTweet: (req, res) => {
    return Tweet.findByPk(req.params.id)
      .then((tweet) => {
        if (tweet === null) {
          return req.flash('error_messages', '無此推文可刪')
        } else {
          tweet.destroy()
            .then((restaurant) => {
              return res.redirect('/admin/tweets')
            })
        }
      })
  },

  adminUserPage: (req, res) => {
    return User.findAll().then(users => {
      return res.render('admin/users', JSON.parse(JSON.stringify({ users })))
    })
  }
}
module.exports = adminController
