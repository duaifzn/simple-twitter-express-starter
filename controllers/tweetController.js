const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const helpers = require('../_helpers')

const tweetController = {
  redirectInvalidUrl: (req, res) => { // 防止亂打網址404
    // req.flash('error_messages', '不要瞎掰好嗎？') // 偶爾輸入正確路徑時非預期出現？
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

    Tweet.create({
      UserId: helpers.getUser(req).id,
      description: req.body.description,
      CheckIn: req.body.CheckIn
    }).then(tweet => {
      return res.redirect('back')
    })
  },

  tweetHomePage: (req, res) => {
    Tweet.findAll({ include: [Like, Reply, User] }).then(tweets => {
      tweets = tweets.map(tweet => (
        {
          ...tweet.dataValues,
          isLiked: tweet.Likes.map(l => l.UserId).includes(helpers.getUser(req).id)
        }))
      tweets = tweets.sort((a, b) => b.updatedAt - a.updatedAt)

      User.findAll({
        include: [{ model: User, as: 'Followers' }, { model: User, as: 'Followings' }]
      }).then(users => {
        let Users = users.map(user => (
          {
            ...user.dataValues,
            PopularNumber: user.Followers.length,
            introduction: user.dataValues.introduction !== null ? user.dataValues.introduction.substring(0, 50) : '',
            isFollowed: user.Followers.map(u => u.id).includes(helpers.getUser(req).id)
          }
        ))
        Users = Users.sort((a, b) => b.PopularNumber - a.PopularNumber).slice(0, 10)
        return res.render('tweetHomePage', JSON.parse(JSON.stringify({ users: Users, tweets })))
      })
    })
  },

  tweetReplyPage: (req, res) => {
    Tweet.findByPk(req.params.tweet_id, {
      include: [
        Like,
        {
          model: User,
          include: [
            Like,
            Tweet,
            { model: User, as: 'Followings' },
            { model: User, as: 'Followers' }]
        },
        { model: Reply, include: [User] }
      ]
    }).then(tweet => {
      const likeNumber = tweet.User.Likes.length
      const followerNumber = tweet.User.Followings.length
      const followingNumber = tweet.User.Followers.length
      const tweetNumber = tweet.User.Tweets.length
      const replyNumber = tweet.Replies.length
      const likedNumber = tweet.Likes.length
      const isLiked = tweet.Likes.map(l => l.UserId).includes(helpers.getUser(req).id)
      const isFollowed = helpers.getUser(req).Followings.map(d => d.id).includes(tweet.UserId)
      return res.render('tweetReplyPage', JSON.parse(JSON.stringify({
        tweet, likeNumber, followerNumber, followingNumber, tweetNumber, replyNumber, likedNumber, isLiked, isFollowed
      })))
    }).catch(users => {
      req.flash('error_messages', '無此貼文！')
      return res.redirect('/tweets')
    })
  },

  createTweetReply: (req, res) => {
    Reply.create({
      UserId: helpers.getUser(req).id,
      TweetId: req.params.tweet_id,
      comment: req.body.text
    }).then(() => {
      return res.redirect('back')
    })
  },

  createLike: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      TweetId: req.params.id
    }).then(tweet => {
      return res.redirect('back')
    })
  },

  deleteLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        TweetId: req.params.id
      }
    }).then(like => {
      like.destroy().then(() => {
        return res.redirect('back')
      })
    })
  }

}

module.exports = tweetController
