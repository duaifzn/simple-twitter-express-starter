const userController = require('../controllers/userController')

module.exports = app => {
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

  // app.get('', (req, res) => {
  //   res.send('hello')
  // })
}