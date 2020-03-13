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
    Tweet.findAll({ include: [Like, Reply, User] }).then(tweets => {

      User.findAll({
        include: [{ model: User, as: 'Followers' }, { model: User, as: "Followings" }]
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
        return res.render('tweetHomePage', JSON.parse(JSON.stringify({ users: users, tweets: tweets })))
      })

    })


  },
  tweetReplyPage: (req, res) => {
    Tweet.findByPk(req.params.tweet_id, {
      include: [
        {
          model: User, include: [
            Tweet,
            { model: User, as: 'Followings' },
            { model: User, as: 'Followers' }]
        },
        Reply,
        Like
      ]
    }).then(tweet => {

      let likeNumber = tweet.Likes.length
      let followerNumber = tweet.User.Followings.length
      let followingNumber = tweet.User.Followers.length
      let tweetNumber = tweet.User.Tweets.length
      let replyNumber = tweet.Replies.length
      let isFollowed = req.user.Followings.map(d => d.id).includes(tweet.UserId)
      return res.render('tweetReplyPage', JSON.parse(JSON.stringify({ tweet: tweet, likeNumber: likeNumber, followerNumber: followerNumber, followingNumber, followingNumber, tweetNumber: tweetNumber, replyNumber: replyNumber, isFollowed: isFollowed })))
    })
  },
  createTweetReply: (req, res) => {
    Reply.create({
      UserId: req.body.userId,
      TweetId: req.params.tweet_id,
      comment: req.body.text
    }).then(() => {
      return res.redirect('back')
    })
  },
  createLike: (req, res) => {

  },
  deleteLike: (req, res) => {

  },

}

module.exports = tweetController