const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const tweetController = {
  redirectInvalidUrl: (req, res) => { // 防止亂打網址404
    res.redirect('back')
  },

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
    Tweet.findAll({ include: [Like, Reply] }).then(tweets => {
      tweets = tweets.map(tweet => (
        {
          ...tweet.dataValues,
          replyNumber: tweet.dataValues.Replies.length,
          likeNumber: tweet.dataValues.Likes.length
        }))

      User.findAll({
        include: { model: User, as: 'Followers' }
      }).then(users => {
        users = users.map(user => (
          {
            ...user.dataValues,
            PopularNumber: user.Followers.length,
            introduction: user.dataValues.introduction !== null ? user.dataValues.introduction.substring(0, 50) : '', // 避免無法處理字串
            isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
          }
        ))
        users = users.sort((a, b) => b.PopularNumber - a.PopularNumber).slice(1, 11)
        return res.render('tweetHomePage', { users: users, tweets: tweets })
      })

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