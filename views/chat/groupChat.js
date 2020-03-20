(function () {
console.log('test')

  // 瀏覽器相容
  const compatMode = document.compatMode === 'CSS1Compat'
  const compactDoc = compatMode ? document.documentElement : document.body

  window.CHAT = {
    msgObj: document.querySelector('#message'),
    screenHeight: window.innerHeight ? window.innerHeight : compactDoc.clientHeight,
    userName: null,
    userId: null,
    socket: null,
    // 讓瀏覽器滾動條保持在最低部
    scrollToBottom: function () {
      window.scrollTo(0, this.msgObj.clientHeight)
    },
    submit: function () {
      const content = document.querySelector('#content').value
      if (content !== '') {
        const obj = {
          userId: this.userId,
          userName: this.userName,
          content: content
        }
        this.socket.emit('message', obj)
        document.querySelector('#content').value = ''
      }
      return false
    },
    genUid: function () {
      return new Date().getTime() + '' + Math.floor(Math.random() * 899 + 100)
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
      const section = document.createElement('section')
      section.className = 'system J-mjrlinkWrap J-cutMsg'
      section.innerHTML = HTML
      this.msgObj.appendChild(section)
      this.scrollToBottom()
    },
    // 第一個介面使用者提交使用者名稱
    usernameSubmit: function () {
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
      /*
      客戶端根據時間和隨機數生成uid,這樣使得聊天室使用者名稱稱可以重複。
      實際專案中，如果是需要使用者登入，那麼直接採用使用者的uid來做標識就可以
      */
      this.userId = this.genUid()
      this.userName = userName

      document.querySelector('#show-user-name').innerHTML = this.userName
      this.msgObj.style.minHeight = (this.screenHeight - document.body.clientHeight + this.msgObj.clientHeight) + 'px'
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
        const contentDiv = '<div>' + obj.content + '</div>'
        const usernameDiv = '<span>' + obj.userName + '</span>'

        const section = document.createElement('section')
        if (obj.userId === CHAT.userId) {
          section.className = 'user'
          section.innerHTML = contentDiv + usernameDiv
        } else {
          section.className = 'service'
          section.innerHTML = usernameDiv + contentDiv
        }
        CHAT.msgObj.appendChild(section)
        CHAT.scrollToBottom()
      })
    }
  }
  // 通過“Enter”提交使用者名稱
  document.querySelector('#user-name').onkeydown = (event) => {
    const CHAT = window.CHAT
    if (event.keyCode === 13) {
      CHAT.usernameSubmit()
    }
  }
  // 通過“Enter”提交資訊
  document.querySelector('#content').onkeydown = (event) => {
    const CHAT = window.CHAT
    if (event.keyCode === 13) {
      CHAT.submit()
    }
  }
})()
