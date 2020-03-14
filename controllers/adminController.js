const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const pageLimit = 20

const adminController = {
  adminHomePage: (req, res) => {
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    return Tweet.findAndCountAll({
      include: User, offset: offset, limit: pageLimit
    }).then(tweets => {
      // data for pagination
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(tweets.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      for (let i = 0; i < tweets.rows.length; i++) {
        tweets.rows[i].description = tweets.rows[i].description.length > 50 ? (tweets.rows[i].description.slice(0, 50) + '...') : tweets.rows[i].description // 只擷取前50字元顯示，此外顯示原文
      }
      // console.log('test', tweets.rows)
      return res.render('admin/tweets', JSON.parse(JSON.stringify({
        tweets,
        page: page,
        totalPage: totalPage,
        prev: prev,
        next: next
      })))
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
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    return User.findAndCountAll({
      include: offset, limit: pageLimit
    }).then(users => {
      // data for pagination
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(users.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      return res.render('admin/users', JSON.parse(JSON.stringify({
        users,
        page: page,
        totalPage: totalPage,
        prev: prev,
        next: next
      })))
    })
    // return User.findAll().then(users => {
    //   return res.render('admin/users', JSON.parse(JSON.stringify({ users })))
    // })
  }
}
module.exports = adminController
