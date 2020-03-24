// adapt from: https://blog.csdn.net/lizhipeng123321/article/details/79480835

(function () {
  // 舊版瀏覽器相容設定
  const compatMode = document.compatMode === 'CSS1Compat'
  const compactDoc = compatMode ? document.documentElement : document.body

  // 將設定動作包成物件
  window.CHAT = {
    msgObj: document.querySelector('#messages'),
    screenHeight: window.innerHeight ? window.innerHeight : compactDoc.clientHeight,
    userName: null,
    userId: null,
    socket: null,

    // 讓瀏覽器捲軸保持在最低部，以便閱讀新訊息
    scrollToBottom: function () {
      this.msgObj.scrollTo(0, this.msgObj.scrollHeight)
    },

    submit: function () {
      const content = document.querySelector('#content')
      const receiver = document.querySelector('#receiver')
      console.log('receiverId:', receiver.value)

      if (content.value !== '') {
        const obj = {
          userId: this.userId,
          userName: this.userName,
          content: content.value,
          receiverId: receiver.value.toString()
        }

        if (!receiver.value) {
          this.socket.emit('publicMessage', obj)
        } else {
          this.socket.emit('privateMessage', (obj))
        }
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
      console.log(obj, 'res')
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
          userHTML += separator + onlineUsers[key] + '"' + key + '"'
          separator = '、'
        }
      }
      document.querySelector('#online-count').innerHTML = '當前共有 ' + onlineCount + ' 人線上，線上列表：' + userHTML

      // 新增系統訊息
      let HTML = ''
      HTML += '<h5 class="msg-system d-flex justify-content-center py-3 text-info">'
      HTML += user.userName
      HTML += `"${user.userId}"`
      HTML += (action === 'login') ? ' 加入了聊天室' : ' 退出了聊天室'
      HTML += '</h5>'
      const blockquote = document.createElement('blockquote')
      blockquote.className = 'system-message'
      blockquote.innerHTML = HTML
      this.msgObj.appendChild(blockquote)
      this.scrollToBottom()
    },
    // 送出使用者名稱，登入上線聊天室
    submitUserName: function () {
      const userName = document.querySelector('#user-name').value
      if (userName !== '') {
        this.init(userName)
      }
    },
    // 上線後，初始化聊天室介面
    init: function (userName) {
      const CHAT = window.CHAT
      const io = window.io

      this.userId = this.getUserId()
      this.userName = userName
      this.scrollToBottom()

      // 連線websocket後端伺服器
      this.socket = io.connect('ws://localhost:8080/')

      // 告訴伺服器端有使用者登入
      this.socket.emit('login', { userId: this.userId, userName: this.userName })
      this.socket.emit('personalRoom', { userId: this.userId })

      // 監聽新使用者登入
      this.socket.on('login', function (obj) {
        CHAT.updateSysMsg(obj, 'login')
      })

      // 監聽使用者退出
      this.socket.on('logout', function (obj) {
        CHAT.updateSysMsg(obj, 'logout')
      })

      function formatDate (date) {
        const y = date.getFullYear()
        let m = date.getMonth() + 1
        m = m < 10 ? ('0' + m) : m
        let d = date.getDate()
        d = d < 10 ? ('0' + d) : d
        let hour = date.getHours()
        hour = hour < 10 ? ('0' + hour) : hour
        let minute = date.getMinutes()
        minute = minute < 10 ? ('0' + minute) : minute
        let second = date.getSeconds()
        second = second < 10 ? ('0' + second) : second
        return y + '-' + m + '-' + d + ' ' + hour + ':' + minute + ':' + second
      }

      function renderMessage (obj) {
        const messageSpan = `<span>${obj.userName}：<br/>${obj.content}<br/>`
        const dateSpan = `(${formatDate(new Date())})</span>`

        const blockquote = document.createElement('blockquote')
        if (obj.userId === CHAT.userId) {
          blockquote.className = 'user d-flex justify-content-end'
        } else {
          blockquote.className = 'other d-flex justify-content-start'
        }
        blockquote.innerHTML = messageSpan + dateSpan

        if (obj.receiverId) {
          blockquote.innerHTML = `<span class="text-danger">(私訊給"${obj.receiverId}")</span>` + blockquote.innerHTML
        }
        CHAT.msgObj.appendChild(blockquote)
        CHAT.scrollToBottom()
      }

      // 監聽訊息傳送(群聊)
      this.socket.on('publicMessage', function (obj) {
        renderMessage(obj)
      })
      // 監聽訊息傳送(私訊)
      this.socket.on('privateMessage', function (obj) {
        renderMessage(obj)
      })
    }
  }
  // 通過按“Enter”可提交訊息
  document.querySelector('#content').onkeydown = (event) => {
    const CHAT = window.CHAT
    if (event.keyCode === 13) {
      CHAT.submit()
    }
  }

  // 進入聊天室路由後，自動送出使用者名稱準備登入
  if (document.querySelector('#user-name').value) {
    const CHAT = window.CHAT
    CHAT.submitUserName()
  }

  // 避免意外離開聊天室
  window.onbeforeunload = () => {
    return 'Are you sure you want to leave?'
  }
})()
