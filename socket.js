// adapt from: https://blog.csdn.net/lizhipeng123321/article/details/79480835

const app = require('express')()
const port = process.env.PORT || 8080
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.get('/', (req, res) => {
  res.send('<h1>Welcome Realtime Server</h1>')
})

// 線上使用者名單
const onlineUsers = {}
// 當前線上人數
let onlineCount = 0

io.on('connection', (socket) => {
  console.log('Connected')

  // 監聽新使用者加入
  socket.on('login', (obj) => {
    // 將新加入使用者的唯一標識當作socket的名稱，後面退出的時候會用到
    socket.name = obj.userId

    // 檢查線上列表，如果不在裡面就加入
    if (!onlineUsers.hasOwnProperty(obj.userId)) {
      onlineUsers[obj.userId] = obj.userName
      // 線上人數+1
      onlineCount++
    }

    // 向所有客戶端廣播使用者加入
    io.emit('login', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj })
    console.log(obj.userName + '已上線！')
  })

  // 監聽使用者退出
  socket.on('disconnect', () => {
    // 將退出的使用者從線上列表中刪除
    if (onlineUsers.hasOwnProperty(socket.name)) {
      // 退出使用者的資訊
      const obj = { userId: socket.name, userName: onlineUsers[socket.name] }

      // 刪除
      delete onlineUsers[socket.name]
      // 線上人數-1
      onlineCount--

      // 向所有客戶端廣播使用者退出
      io.emit('logout', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj })
      console.log(obj.userName + '已下線！')
    }
  })

  // 監聽使用者釋出聊天內容
  socket.on('message', (obj) => {
    // 向所有客戶端廣播發布的訊息
    io.emit('message', obj)
    console.log(obj.userName + '：' + obj.content)
  })
})

server.listen(port, () => {
  console.log(`Socket server is listening on port ${port}`)
  console.log(`Enter http://localhost:${port}/ if you run on your local computer.`)
})
