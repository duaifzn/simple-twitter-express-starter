const db = require('../models')
const User = db.User
const Like = db.Like
const Tweet = db.Tweet
const helpers = require('../_helpers')
const bcrypt = require('bcryptjs')

const userController = {
  tweetPage: (req, res) => {
    return res.send(`User${req.params.id} 的 Tweet`)
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
      user.update({
        name: req.body.name
      }).then(user => {
        console.log('user', user.name)
        return res.redirect('back')
      })
    })
  },
  followingPage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followings' }
      ]
    }).then(user => {
      return res.render('followingPage', JSON.parse(JSON.stringify({ user: user })))
    })
  },
  followerPage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(user => {
      return res.render('followerPage', JSON.parse(JSON.stringify({ user: user })))
    })
  },
  likePage: (req, res) => {
    User.findByPk(req.params.id, {
      include: [{ model: Like, include: [Tweet] }]
    }).then(user => {
      return res.render('likePage', JSON.parse(JSON.stringify({ user: user })))
    })
  },
  signInPage: (req, res) => {
    return res.render('signInPage')
  },
  signIn: (req, res) => {
    req.flash('success_messages', 'Login successfully')
    return res.redirect('/')
  },
  signUpPage: (req, res) => {
    return res.render('signUpPage')
  },
  signUp: (req, res) => {
    if (req.body.password !== req.body.password2) {
      req.flash('error_message', '密碼輸入不相同')
      return res.redirect('/signup')
    }
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) {
          req.flash('error_message', '帳號已註冊')
          return res.redirect('/signup')
        }
        else {
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

  },
  deleteFollowship: (req, res) => {

  }

}

module.exports = userController
