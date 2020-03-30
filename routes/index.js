const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController')
const tweetController = require('../controllers/tweetController')
const chatController = require('../controllers/chatController')

const helpers = require('../_helpers')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

//websocket 紀錄client的位置
let position = []

module.exports = (app, passport) => {
  const expressWs = require('express-ws')(app)
  const unAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next()
    }
    res.redirect('/')
    return req.flash('error_messages', '已登入')
  }
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (req.user.role === 'admin') { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }
  // 轉向/tweets
  app.get('/', authenticated, (req, res) => {
    res.redirect('/tweets')
  })

  // 登入頁面
  app.get('/signin', unAuthenticated, userController.signInPage)
  // 登入
  app.post('/signin', unAuthenticated, passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }), userController.signIn)
  // 註冊頁面
  app.get('/signup', userController.signUpPage)
  // 註冊
  app.post('/signup', userController.signUp)
  // 登出
  app.get('/logout', userController.logOut)

  // 聊天室
  app.get('/chat', authenticated, chatController.chatPage)

  // 看見某一使用者的推播牆，以及該使用者簡介
  app.get('/users/:id/tweets', authenticated, userController.tweetPage)
  // 編輯自己的介紹 (表單頁)
  app.get('/users/:id/edit', authenticated, userController.editUserPage)
  // 編輯自己的介紹 (寫入資料庫)
  app.post('/users/:id/edit', authenticated, upload.single('image'), userController.editUser)
  // 看見某一使用者正在關注的使用者
  app.get('/users/:id/followings', authenticated, userController.followingPage)
  // 看見某一使用者的跟隨者
  app.get('/users/:id/followers', authenticated, userController.followerPage)
  // 看見某一使用者按過 like 的推播
  app.get('/users/:id/likes', authenticated, userController.likePage)

  // 看見站內所有的推播，以及跟隨者最多的使用者 (設為前台首頁)
  app.get('/tweets', authenticated, tweetController.tweetHomePage)

  //websocket
  app.ws('/tweets', function (ws, req) {
    console.log('Client connected')
    //存入連接伺服器的client 的ws位置
    position[`${req.userData.id}`] = ws

    ws.on('message', data => {
      //提取追隨者的ws位置
      let followers = []
      req.userData.Followers.forEach(user => {
        if (position[`${user.id}`] !== null) {
          followers.push(position[`${user.id}`])
        }
      })
      //搜尋所有連接伺服器的client
      var aWss = expressWs.getWss('/tweets');
      aWss.clients.forEach(function (client) {
        //如果是追隨者才傳資料
        if (followers.includes(client)) {
          client.send(data)
        }
      });
    })
    ws.on('close', () => {
      console.log('Close connected')
    })
  })
  app.post('/tweets', authenticated, tweetController.createTweet)

  // 可以在這頁回覆特定的 tweet，並看見 tweet 主人的簡介
  app.get('/tweets/:tweet_id/replies', authenticated, tweetController.tweetReplyPage)
  // 將回覆的內容寫入資料庫
  app.post('/tweets/:tweet_id/replies', authenticated, tweetController.createTweetReply)

  // 新增一筆 followship 記錄
  app.post('/followships', authenticated, userController.createFollowship)
  // 刪除一筆 followship 記錄
  app.delete('/followships/:followingId', authenticated, userController.deleteFollowship)

  // 新增一筆 like 記錄
  app.post('/tweets/:id/like', authenticated, tweetController.createLike)
  // 刪除一筆 like 記錄
  app.delete('/tweets/:id/unlike', authenticated, tweetController.deleteLike)

  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/tweets'))
  // 看見站內所有的推播 (設為後台首頁)
  app.get('/admin/tweets', authenticatedAdmin, adminController.adminHomePage)
  // 刪除其他使用者的推文
  app.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweet)
  // 看見站內所有的使用者
  app.get('/admin/users', authenticatedAdmin, adminController.adminUserPage)

  app.all('*', tweetController.redirectInvalidUrl) // 避免404當掉
}
