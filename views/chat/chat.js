(function () {
  // 瀏覽器相容
  const compatMode = document.compatMode === 'CSS1Compat'
  const compactDoc = compatMode ? document.documentElement : document.body

  window.CHAT = {
    msgObj: document.querySelector('#messages'),
    screenHeight: window.innerHeight ? window.innerHeight : compactDoc.clientHeight,
    userName: null,
    userId: null,
    socket: null,

    // 讓瀏覽器滾動條保持在最低部
    scrollToBottom: function () {
      this.msgObj.scrollTo(0, this.msgObj.scrollHeight)
    },

    submit: function () {
      const content = document.querySelector('#content')
      if (content.value !== '') {
        const obj = {
          userId: this.userId,
          userName: this.userName,
          content: content.value
        }
        this.socket.emit('message', obj)
        content.value = ''
        content.placeholder = '請按Enter送出聊天內容'
      } else {
        content.placeholder = '請輸入訊息！'
      }
    },
    getUserId: function () {
      return document.querySelector('#user-id').value
    },

    // 更新系統訊息，本例中在使用者加入、退出的時候呼叫
    updateSysMsg: function (obj, action) {
      // 當前線上使用者列表
      const onlineUsers = obj.onlineUsers
      // 當前線上人數
      const onlineCount = obj.onlineCount
      // 新加入使用者的資訊
      const user = obj.user

      // 更新線上人數
      let userHTML = ''
      let separator = ''
      for (const key in onlineUsers) {
        if (onlineUsers.hasOwnProperty(key)) {
          userHTML += separator + onlineUsers[key]
          separator = '、'
        }
      }
      document.querySelector('#online-count').innerHTML = '當前共有 ' + onlineCount + ' 人線上，線上列表：' + userHTML

      // 新增系統訊息
      let HTML = ''
      HTML += '<div class="msg-system">'
      HTML += user.userName
      HTML += (action === 'login') ? ' 加入了聊天室' : ' 退出了聊天室'
      HTML += '</div>'
      const blockquote = document.createElement('blockquote')
      blockquote.className = 'system-message'
      blockquote.innerHTML = HTML
      this.msgObj.appendChild(blockquote)
      this.scrollToBottom()
    },
    // 第一個介面使用者提交使用者名稱
    submitUserName: function () {
      const userName = document.querySelector('#user-name').value
      if (userName !== '') {
        document.querySelector('#user-name').value = ''
        document.querySelector('#login-box').style.display = 'none'
        document.querySelector('#chat-box').style.display = 'block'
        this.init(userName)
      }
      return false
    },

    init: function (userName) {
      const CHAT = window.CHAT
      this.userId = this.getUserId()
      this.userName = userName
      this.scrollToBottom()

      // 連線websocket後端伺服器
      this.socket = io.connect('ws://localhost:8080/')

      // 告訴伺服器端有使用者登入
      this.socket.emit('login', { userId: this.userId, userName: this.userName })

      // 監聽新使用者登入
      this.socket.on('login', function (obj) {
        CHAT.updateSysMsg(obj, 'login')
      })

      // 監聽使用者退出
      this.socket.on('logout', function (obj) {
        CHAT.updateSysMsg(obj, 'logout')
      })

      // 監聽訊息傳送
      this.socket.on('message', function (obj) {
        const messageSpan = `${obj.userName}：${obj.content}`

        const blockquote = document.createElement('blockquote')
        if (obj.userId === CHAT.userId) {
          blockquote.className = 'user'
        } else {
          blockquote.className = 'other'
        }
        blockquote.innerHTML = messageSpan
        CHAT.msgObj.appendChild(blockquote)
        CHAT.scrollToBottom()
      })
    }
  }
  // 通過“Enter”提交訊息
  document.querySelector('#content').onkeydown = (event) => {
    const CHAT = window.CHAT
    if (event.keyCode === 13) {
      CHAT.submit()
    }
  }

  // window.onbeforeunload = () => {
  //   return 'Are you sure you want to leave?'
  // }
})()
