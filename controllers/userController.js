const db = require('../models')
const User = db.User
const Like = db.Like
const Tweet = db.Tweet
const Reply = db.Reply
const Followship = db.Followship
const helpers = require('../_helpers')
const bcrypt = require('bcryptjs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  tweetPage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        Like,
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(user => {
      let isFollowed = []
      if (user) { isFollowed = user.Followers.map(u => u.id).includes(helpers.getUser(req).id) }
      Tweet.findAll({ include: [Like, Reply, User], where: { UserId: req.params.id } })
        .then(tweets => {
          // console.log(tweets, 'tweets')
          if (!user) {
            req.flash('error_messages', "this user didn't exist!")
            res.redirect('/tweets')
          }
          tweets = tweets.map(tweet => (
            {
              ...tweet.dataValues,
              isLiked: tweet.Likes.map(l => l.UserId).includes(helpers.getUser(req).id)
            }
          ))
          tweets = tweets.sort((a, b) => b.updatedAt - a.updatedAt)
          return res.render('tweetPage', JSON.parse(JSON.stringify({ userData: user, tweets, isFollowed })))
        })
        .catch((user) => {
          req.flash('error_messages', 'system error, try later!')
        })
    })
  },

  editUserPage: (req, res) => {
    if (Number(req.params.id) !== helpers.getUser(req).id) { // 防止進入他人修改頁面偷改資料
      req.flash('error_messages', '只能改自己的頁面！')
      res.redirect(`/users/${helpers.getUser(req).id}/edit`)
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          return res.render('editUserPage', JSON.parse(JSON.stringify({ userData: user })))
        })
        .catch((err) => {
          req.flash('error_messages', "this user didn't exist!")
          res.redirect('/tweets')
        })
    }
  },

  editUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    if (Number(req.params.id) !== helpers.getUser(req).id) { // 防止用 POSTMAN 發送 PutUser 的 HTTP請求，這樣還是可以改到別人的資料
      req.flash('error_messages', '只能改自己的頁面！')
      res.redirect(`/users/${helpers.getUser(req).id}/edit`)
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      // console.log('ID', IMGUR_CLIENT_ID, file.path)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id).then(user => {
          user
            .update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: file ? img.data.link : user.image
            })
            .then((user) => {
              req.flash(
                'success_messages',
                'Your profile was successfully to update'
              )
              res.redirect(`/users/${user.id}/tweets`)
            })
            .catch((user) => {
              req.flash('error_messages', 'unexpected error, try later...')
            })
        })
      })
    } else {
      return User.findByPk(req.params.id).then(user => {
        user
          .update({
            name: req.body.name,
            introduction: req.body.introduction,
            avatar: user.image
          })
          .then((user) => {
            req.flash(
              'success_messages',
              'Your profile was successfully to update'
            )
            res.redirect(`/users/${user.id}/tweets`)
          })
          .catch((user) => {
            req.flash('error_messages', 'unexpected error, try later...')
          })
      })
    }
  },

  followingPage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        Tweet,
        Like,
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(userData => {
      if (!userData) {
        req.flash('error_messages', "this user didn't exist!")
        res.redirect('/tweets')
      }

      let isFollowed = []
      if (userData) { isFollowed = userData.Followers.map(u => u.id).includes(helpers.getUser(req).id) }

      userData.Followings = userData.Followings.sort((a, b) => b.Followship.updatedAt - a.Followship.updatedAt)

      userData.Followings = userData.Followings.map(follower => (
        {
          ...follower.dataValues,
          isFollowed: userData.Followings.map(u => u.id).includes(follower.id)
        }
      ))

      return res.render(
        'followingPage',
        JSON.parse(JSON.stringify({ userData, userFollowings: userData.Followings, isFollowed }))
      )
    }).catch((user) => {
      req.flash('error_messages', 'system error, try later!')
    })
  },

  followerPage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        Like,
        Tweet,
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    }).then(userData => {
      if (!userData) {
        req.flash('error_messages', "this user didn't exist!")
        res.redirect('/tweets')
      }

      let isFollowed = []
      if (userData) { isFollowed = userData.Followers.map(u => u.id).includes(helpers.getUser(req).id) }

      userData.Followers = userData.Followers.sort((a, b) => b.Followship.updatedAt - a.Followship.updatedAt)

      userData.Followers = userData.Followers.map(follower => (
        {
          ...follower.dataValues,
          isFollowed: userData.Followings.map(u => u.id).includes(follower.id)
        }
      ))

      // console.log('test', userData.Followers[0].name, userData.Followers[0].isFollowed)

      return res.render(
        'followerPage',
        JSON.parse(JSON.stringify({ userData, userFollowers: userData.Followers, isFollowed }))
      )
    }).catch((user) => {
      req.flash('error_messages', 'system error, try later!')
    })
  },
  likePage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        Like,
        Tweet,
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    }).then(userData => {
      if (!userData) {
        req.flash('error_messages', "this user didn't exist!")
        res.redirect('/tweets')
      }

      let isFollowed = []
      if (userData) { isFollowed = userData.Followers.map(u => u.id).includes(helpers.getUser(req).id) }

      Like.findAll({ include: [Tweet], where: { UserId: req.params.id } })
        .then(likes => {
          const likeTweet = []
          likes.forEach(l => {
            likeTweet.push(l.TweetId)
          })
          Tweet.findAll({ include: [Reply, Like, User], where: { id: likeTweet } })
            .then(tweets => {
              let data = tweets.map(tweet => (
                {
                  ...tweet.dataValues,
                  isLiked: true
                }
              ))
              data = data.sort((a, b) => b.Likes.find(el => el.UserId === parseInt(req.params.id)).updatedAt - a.Likes.find(el => el.UserId === parseInt(req.params.id)).updatedAt)
              // console.log(data[0].Likes.find(el => el.UserId === parseInt(req.params.id)), 'test tweets')

              return res.render('likePage', JSON.parse(JSON.stringify({ userData, tweets: data, isFollowed })))
            })
        }).catch((user) => {
          req.flash('error_messages', 'system error, try later!')
        })
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
          password: bcrypt.hashSync(req.body.password, 10),
          role: 'user',
          avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/User_font_awesome.svg/512px-User_font_awesome.svg.png'
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
    if (Number(req.body.id) === helpers.getUser(req).id) {
      req.flash('error_messages', '不能追蹤自己')
      return res.redirect('back')
    } else {
      return Followship.create({
        followerId: helpers.getUser(req).id,
        followingId: req.body.id
      }).then(followship => {
        return res.redirect('back')
      })
    }
  },

  deleteFollowship: (req, res) => {
    Followship.destroy({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.followingId
      }
    }).then(Followship => {
      return res.redirect('back')
    })
  }
}

module.exports = userController
