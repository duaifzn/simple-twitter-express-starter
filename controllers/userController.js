const db = require('../models')
const User = db.User
const Like = db.Like
const Tweet = db.Tweet
const Reply = db.Reply
const Followship = db.Followship
const helpers = require('../_helpers')
const bcrypt = require('bcryptjs')

const userController = {
  tweetPage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Tweet, include: [Like, Reply, User] },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(user => {
      const tweets = []
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id)
      const followerNum = user.Followers.length
      const followingNum = user.Followings.length
      user.Tweets.map(tweet => {
        tweets.push(tweet.User)
      })

      Tweet.findAll({ include: [Like, Reply, User] })
        .then(tweets => {
          tweets = tweets.map(tweet => ({
            ...tweet.dataValues,
            isLiked: req.user.LikedTweets.map(d => d.id).includes(tweet.id)
          }))

          return res.render(
            'tweetPage',
            JSON.parse(JSON.stringify({ userData: user, isFollowed, followerNum, followingNum, tweets })
            )
          )
        })
    })
      .catch(users => {
        req.flash('error_messages', '無此使用者！')
        return res.redirect('/tweets')
      })
  },

  editUserPage: (req, res) => {
    if (req.params.id === 1) {
      return res.render('editUserPage')
    } else {
      return res.redirect(`/users/${req.params.id}/edit`)
    }
  },

  editUser: (req, res) => {
    // console.log('req.body:', req.body)
    // console.log('req.params:', req.params)
    User.findByPk(req.params.id).then(user => {
      user
        .update({
          name: req.body.name
        })
        .then(user => {
          // console.log('user', user.name)
          return res.redirect('back')
        })
    })
  },

  followingPage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        Like,
        Reply,
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        { model: Tweet, as: 'LikedTweets' }
      ]
    }).then(userData => {
      return res.render(
        'followingPage',
        JSON.parse(JSON.stringify({ userData: userData }))
      )
    })
    // 原本資料架構
    // User.findByPk(req.params.id, {
    //   include: [
    //     Like,
    //     Tweet,
    //     Reply,
    //     { model: User, as: "Followings" },
    //     { model: User, as: "Followers" }]
    // }).then(user => {
    //   return res.render(
    //     "followingPage",
    //     JSON.parse(JSON.stringify({ user: user }))
    //   );
    // });
  },

  followerPage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        Like,
        Reply,
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        { model: Tweet, as: 'LikedTweets' }]
    }).then(userData => {
      return res.render(
        'followerPage',
        JSON.parse(JSON.stringify({ userData: userData }))
      )
    })
    // 原本資料架構
    // User.findByPk(req.params.id, {
    //   include: [
    //     Like,
    //     Tweet,
    //     Reply,
    //     { model: User, as: "Followings" },
    //     { model: User, as: "Followers" }]
    // }).then(user => {
    //   return res.render(
    //     "followerPage",
    //     JSON.parse(JSON.stringify({ user: user }))
    //   );
    // });
  },
  likePage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        Reply,
        Tweet,
        { model: Like, include: [{ model: Tweet, include: [User, Reply, Like] }] },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    }).then(userData => {
      return res.render('likePage', JSON.parse(JSON.stringify({ userData: userData })))
    })
  },

  signInPage: (req, res) => {
    return res.render('signInPage')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '登入成功')
    return res.redirect('/')
  },

  signUpPage: (req, res) => {
    return res.render('signUpPage')
  },

  signUp: (req, res) => {
    if (req.body.password !== req.body.password2) {
      req.flash('error_messages', '密碼輸入不相同')
      return res.redirect('back')
    }
    User.findOne({ where: { email: req.body.email } }).then(user => {
      if (user) {
        req.flash('error_messages', '帳號已註冊')
        return res.redirect('back')
      } else {
        User.create({
          name: req.body.name,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10)
        }).then(user => {
          req.flash('success_messages', '成功註冊')
          return res.redirect('/signin')
        })
      }
    })
  },

  logOut: (req, res) => {
    req.flash('success_messages', '登出成功')
    req.logout()
    res.redirect('/signin')
  },

  createFollowship: (req, res) => {
    if (req.params.userId === req.user.id) {
      req.flash('error_messages', '不能追蹤自己')
      return res.redirect('back')
    } else {
      return Followship.create({
        followerId: req.user.id,
        followingId: req.params.userId
      }).then(followship => {
        return res.redirect('back')
      })
    }
  },

  deleteFollowship: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then(followship => {
      followship.destroy().then(followship => {
        return res.redirect('back')
      })
    })
  },

  createLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      TweetId: req.params.tweetId
    }).then(tweet => {
      return res.redirect('back')
    })
  },

  deleteLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        TweetId: req.params.tweetId
      }
    }).then(like => {
      like.destroy().then(tweet => {
        return res.redirect('back')
      })
    })
  }
}

module.exports = userController
