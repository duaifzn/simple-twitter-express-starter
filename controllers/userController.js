const db = require('../models')
const User = db.User
const Like = db.Like
const Tweet = db.Tweet
const helpers = require('../_helpers')
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
    res.render('signInPage')
  },
  signIn: (req, res) => {
    req.flash('success_messages', 'Login successfully')
    res.redirect('/restaurants')
  },
  signUpPage: (req, res) => {

  },
  signUp: (req, res) => {

  },
  logOut: (req, res) => {
    req.flash('success_messages', 'Logout successfully')
    req.logout()
    res.redirect('/signin')
  },
  createFollowship: (req, res) => {

  },
  deleteFollowship: (req, res) => {

  }

}

module.exports = userController
