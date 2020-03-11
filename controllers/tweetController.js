const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const tweetController = {
  createTweet: (req, res) => {
    User.findByPk(1).then(user => {
      Tweet.create({
        UserId: user.id,
        description: req.body.description
      }).then(tweet => {
        res.redirect('back')
      })
    })
  },
  tweetHomePage: (req, res) => {
    Tweet.findAll().then(tweets => {
      return res.render('tweetHomePage', JSON.parse(JSON.stringify({ tweets: tweets })))
    })
  },
  tweetReplyPage: (req, res) => {

  },
  createTweetReply: (req, res) => {

  },
  createLike: (req, res) => {

  },
  deleteLike: (req, res) => {

  },

}

module.exports = tweetController