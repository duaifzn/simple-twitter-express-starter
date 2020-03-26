// 修改自：https://blog.csdn.net/lizhipeng123321/article/details/79480835

const app = require('express')()
const port = process.env.PORT || 8080
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Realtime Websocket Server</h1>')
})

// 線上使用者名單
const onlineUsers = {}
// 當前線上人數
let onlineCount = 0

io.on('connection', (socket) => {
  console.log('Websocket connected')

  // 監聽新使用者加入
  socket.on('login', (obj) => {
    // 將新加入使用者的唯一標識當作socket的名稱，後面退出的時候會用到
    socket.name = obj.userId

    // 檢查線上列表，如果不在裡面就加入
    const hasOwnProperty = Object.prototype.hasOwnProperty.call(onlineUsers, obj.userId)
    if (!hasOwnProperty) {
      onlineUsers[obj.userId] = obj.userName
      // 線上人數+1
      onlineCount++
    }

    // 向所有客戶端廣播使用者加入
    io.emit('login', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj })
    console.log(obj.userName + '已上線！')
  })

  // 監聽使用者登出(離開聊天室頁面)
  socket.on('disconnect', () => {
    // 將登出的使用者從線上列表中刪除
    const hasOwnProperty = Object.prototype.hasOwnProperty.call(onlineUsers, socket.name)
    if (hasOwnProperty) {
      // 登出使用者的資訊
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
  socket.on('publicMessage', (obj) => {
    // 向所有客戶端廣播發布的訊息
    io.sockets.emit('publicMessage', obj)
    console.log(obj.userName + '：' + obj.content + ', public')
  })
  // 建立對個人私訊用的房間
  socket.on('personalRoom', (obj) => {
    socket.join(obj.userId)
  })
  // 向指定客戶端廣播發布的訊息
  socket.on('privateMessage', (obj) => {
    if (obj.userId !== obj.receiverId) {
      socket.emit('privateMessage', obj) // 避免私訊給自己時，重複傳給發訊者自己
    }
    if (Object.keys(onlineUsers).indexOf(obj.receiverId) >= 0) { // 對象在線上
      io.to(obj.receiverId).emit('privateMessage', obj) // 傳給指定id的對象
    } else {
      socket.emit('privateMessage', { // 對象不在線上
        userName: '系統提示',
        userId: '警告',
        content: `使用者"${obj.receiverId}"不在線上，<br/>可能因對方已離線、<br/>無帳號使用此id，<br/>或系統連線錯誤！`,
        receiverId: obj.userId,
        receiverName: '使用者'
      })
    }
    console.log(obj.userName + '：' + obj.content + ', private, to: ' + obj.receiverName)
  })
})

server.listen(port, () => {
  console.log(`Socket server is listening on port ${port}`)
  console.log(`Enter http://localhost:${port}/ if you run it on your local computer.`)
})
