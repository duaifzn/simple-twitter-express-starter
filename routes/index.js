const userController = require('../controllers/userController')
const tweetController = require('../controllers/tweetController')
const adminController = require('../controllers/adminController')

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.role === 'admin') { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }
  //轉向/tweets
  app.get('/', (req, res) => {
    res.redirect('/tweets')
  })
  //登入頁面
  app.get('/signin', userController.signInPage)
  //登入
  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }), userController.signIn)
  //註冊頁面
  app.get('/signup', userController.signUpPage)
  //註冊
  app.post('/signup', userController.signUp)
  //登出
  app.get('/logout', userController.logOut)
  //看見某一使用者的推播牆，以及該使用者簡介
  app.get('/users/:id/tweets', userController.tweetPage)
  //編輯自己的介紹 (表單頁)
  app.get('/users/:id/edit', userController.editUserPage)
  //編輯自己的介紹 (寫入資料庫)
  app.post('/users/:id/edit', userController.editUser)
  //看見某一使用者正在關注的使用者
  app.get('/users/:id/followings', userController.followingPage)
  //看見某一使用者的跟隨者
  app.get('/users/:id/followers', userController.followerPage)
  //看見某一使用者按過 like 的推播
  app.get('/users/:id/likes', userController.likePage)
  //看見站內所有的推播，以及跟隨者最多的使用者 (設為前台首頁)
  app.get('/tweets', tweetController.tweetHomePage)
  //將新增的推播寫入資料庫
  app.post('/tweets', tweetController.createTweet)
  //可以在這頁回覆特定的 tweet，並看見 tweet 主人的簡介
  app.get('/tweets/:tweet_id/replies', tweetController.tweetReplyPage)
  //將回覆的內容寫入資料庫
  app.post('/tweets/:tweet_id/replies', tweetController.createTweetReply)
  //新增一筆 followship 記錄
  app.post('/followships', userController.createFollowship)
  //刪除一筆 followship 記錄
  app.delete('/followships/:followingId', userController.deleteFollowship)
  //新增一筆 like 記錄
  app.post('/tweets/:id/like', tweetController.createLike)
  //刪除一筆 like 記錄
  app.post('/tweets/:id/unlike', tweetController.deleteLike)
  //看見站內所有的推播 (設為後台首頁)
  app.get('/admin/tweets', adminController.adminHomePage)
  //刪除其他使用者的推文
  app.delete('/admin/tweets/:id', adminController.deleteTweet)
  //看見站內所有的使用者
  app.get('/admin/users', adminController.adminUserPage)


}