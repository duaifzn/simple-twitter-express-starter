const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply

const tweetController = {
  redirectInvalidUrl: (req, res) => { // 防止亂打網址404
    req.flash('error_messages', '不要瞎掰好嗎？')
    res.redirect('/tweets')
  },

  createTweet: (req, res) => {
    if (!req.body.description) {
      req.flash('error_messages', '要有內容才可以發 tweet!')
      return res.redirect('/tweets')
    }

    if (req.body.description.length > 140) {
      req.flash('error_messages', '每則 tweet 最長只能 140 字')
      return res.redirect('/tweets')
    }

    return Tweet.create({
      UserId: req.user.id,
      description: req.body.description

    }).then(tweet => {
      res.redirect('back')
    })
  },

  tweetHomePage: (req, res) => {
    Tweet.findAll({ include: [Like, Reply, User] }).then(tweets => {
      tweets = tweets.map(tweet => (
        {
          ...tweet.dataValues,
          isLiked: req.user.LikedTweets.map(d => d.id).includes(tweet.id)
        }))
      tweets = tweets.sort((a, b) => b.updatedAt - a.updatedAt)
      User.findAll({
        include: [{ model: User, as: 'Followers' }, { model: User, as: 'Followings' }]
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
          model: User,
          include: [
            Tweet,
            { model: User, as: 'Followings' },
            { model: User, as: 'Followers' }]
        },
        Reply,
        Like
      ]
    }).then(tweet => {
      const likeNumber = tweet.Likes.length
      const followerNumber = tweet.User.Followings.length
      const followingNumber = tweet.User.Followers.length
      const tweetNumber = tweet.User.Tweets.length
      const replyNumber = tweet.Replies.length
      const isFollowed = req.user.Followings.map(d => d.id).includes(tweet.UserId)
      return res.render('tweetReplyPage', JSON.parse(JSON.stringify({ tweet: tweet, likeNumber: likeNumber, followerNumber: followerNumber, followingNumber, tweetNumber: tweetNumber, replyNumber: replyNumber, isFollowed: isFollowed })))
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
  }

}

module.exports = tweetController
