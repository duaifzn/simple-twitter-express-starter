// 修改自: https://blog.csdn.net/lizhipeng123321/article/details/79480835

// 舊版瀏覽器相容設定
const compatMode = document.compatMode === 'CSS1Compat'
const compactDoc = compatMode ? document.documentElement : document.body

// 選取核取方塊
const privateCheck = document.querySelector('#private-check')

// 將設定動作包成物件
window.CHAT = {
  // 相容設定
  screenHeight: window.innerHeight ? window.innerHeight : compactDoc.clientHeight,
  // 物件內共用
  messagesSection: document.querySelector('#messages'),
  receiver: document.querySelector('#receiver'),
  content: document.querySelector('#content'),
  // 預先定義空值
  userId: null,
  userName: null,
  socket: null,
  onlineUsers: {},
  onlineCount: null,

  // 讓瀏覽器捲軸保持在最低部，以便閱讀最新訊息
  scrollToBottom: function () {
    this.messagesSection.scrollTo(0, this.messagesSection.scrollHeight)
  },

  // 送出聊天訊息
  submit: function () {
    if (this.content.value !== '') {
      const messageObj = {
        userId: this.userId,
        userName: this.userName,
        content: this.content.value,
        receiverId: this.receiver.value,
        receiverName: this.onlineUsers[this.receiver.value]
      }

      if (!this.receiver.value) { // 以是否輸入id判斷發的是群聊或私訊
        this.socket.emit('publicMessage', messageObj)
      } else {
        this.socket.emit('privateMessage', messageObj)
      }

      this.content.value = '' // 送出後清空文字
      this.content.placeholder = '按Enter送出文字' // 預設提示文字
    } else {
      this.content.placeholder = '請輸入內容！' // 文字欄空白的提示
    }
  },

  // 更新系統訊息，本例中在使用者登入、登出的時候呼叫
  updateSystemBroadcast: function (obj, action) {
    // 當前線上使用者列表
    this.onlineUsers = obj.onlineUsers
    // 當前線上人數
    this.onlineCount = obj.onlineCount
    // 新加入使用者的資訊
    const onlineUser = obj.user

    // 更新線上人數
    let userHTML = ''
    let separator = ''
    for (const key in this.onlineUsers) { // 產生線上列表
      if (Object.prototype.hasOwnProperty.call(this.onlineUsers, key)) {
        userHTML += separator + this.onlineUsers[key] + '"' + key + '"' // 個別資訊
        separator = '、'
      }
    }

    document.querySelector('#online-count').innerHTML = `當前共有${this.onlineCount}人在線上，線上列表：${userHTML}`

    // 新增系統訊息
    let HTML = ''
    HTML += '<h5 class="msg-system d-flex justify-content-center py-3 text-info">'
    HTML += onlineUser.userName
    HTML += `"${onlineUser.userId}"`
    HTML += (action === 'login') ? ' 加入了聊天室' : ' 退出了聊天室'
    HTML += '</h5>'

    const blockquote = document.createElement('blockquote')
    blockquote.className = 'system-message'
    blockquote.innerHTML = HTML

    this.messagesSection.appendChild(blockquote)
    this.scrollToBottom()
  },

  // 上線後，初始化聊天室介面與啟用各項功能
  init: function (userId, userName) {
    // 方便操作上層物件與socket.io功能，並符合Standard JS標準
    const CHAT = window.CHAT
    const io = window.io

    // 載入使用者ID與名稱
    this.userId = userId
    this.userName = userName

    // 視窗高度短時也能直接看到輸入欄
    this.scrollToBottom()

    // 連線websocket後端伺服器
    this.socket = io.connect('ws://localhost:8080/')

    // 告訴後端伺服器有使用者登入
    this.socket.emit('login', { userId: this.userId, userName: this.userName })
    this.socket.emit('personalRoom', { userId: this.userId })

    // 監聽使用者登入
    this.socket.on('login', function (obj) {
      CHAT.updateSystemBroadcast(obj, 'login')
    })

    // 監聽使用者登出
    this.socket.on('logout', function (obj) {
      CHAT.updateSystemBroadcast(obj, 'logout')
    })

    // 讓時間單位自動補零成二位
    function twoDigit(unit) {
      return unit < 10 ? ('0' + unit) : unit
    }
    // 調整時間格式，以符合臺灣習慣(年*4-月*2-日*2- 時*2:分*2:秒*2)
    function formatDate(date) {
      const year = twoDigit(date.getFullYear())
      const month = twoDigit(date.getMonth() + 1)
      const day = twoDigit(date.getDate())
      const hour = twoDigit(date.getHours())
      const minute = twoDigit(date.getMinutes())
      const second = twoDigit(date.getSeconds())
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
    }

    // 自動轉換內容中的超連結，修改自：https://ourcodeworld.com/articles/read/97/how-to-convert-url-websites-email-from-a-string-to-html-a-tags-with-javascript
    function Linkify(inputText) {
      var replacedText, replacePattern1, replacePattern2, replacePattern3 // 方便同一行宣告，且var為原始寫法

      // 常見開頭，即統一資源識別碼（Uniform Resource Identifier，縮寫：URI）連結
      replacePattern1 = /(\b(wss?|chrome|edge|ssh|git|telnet|ftp|https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim
      replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>')

      // 電子郵件連結
      replacePattern2 = /(([a-zA-Z0-9\-_.])+@[a-zA-Z_]+?(\.[a-zA-Z]{2,6})+)/gim
      replacedText = replacedText.replace(replacePattern2, '<a href="mailto:$1">$1</a>')

      // 手機/市話號碼
      replacePattern3 = /((\d[\d\-.]*){9,})/g
      replacedText = replacedText.replace(replacePattern3, '<a href="tel://$1">$1</a>')

      return replacedText.replace('(', '<br/>(')
    }

    // 渲染對話相關內容
    function renderMessage(obj) {
      // 單條訊息的組成元素
      const receiverSpan = `<span>${obj.userName}"${obj.userId}"：`
      const messageSpan = Linkify(`<br/>${obj.content}<br/>`)
      const dateSpan = `(${formatDate(new Date())})</span>`
      // 單條訊息的組合
      const blockquote = document.createElement('blockquote')

      if (obj.userId === CHAT.userId) { // 自己傳的訊息
        blockquote.className = 'user d-flex justify-content-end' // 排右側、區別
      } else {
        blockquote.className = 'other d-flex justify-content-start'
      }

      if (obj.receiverId) { // 收到的是私訊
        if (obj.receiverName === obj.userName) { // 傳給自己的
          obj.receiverName = '自己' // 區別於其他使用者名稱
        } else if (!obj.receiverName) { // 收到的是系統訊息
          obj.receiverName = 'id:' // 沒名稱用id稱呼
        }
        blockquote.innerHTML = receiverSpan + `<br/>(私訊)</span><span class="text-danger">(給${obj.receiverName}"${obj.receiverId}")` + messageSpan + dateSpan // 私訊訊息的組合
      } else { // 收到的是群聊
        blockquote.innerHTML = receiverSpan + messageSpan + dateSpan // 群聊訊息的組合
      }

      CHAT.messagesSection.appendChild(blockquote)
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
  },

  // 送出使用者名稱，並登入上線
  submitUserName: function () {
    const userId = document.querySelector('#user-id').value
    const userName = document.querySelector('#user-name').value
    if (userName !== '') {
      this.init(userId, userName)
    }
  }
}

// 進入聊天室路由對應頁面後，自動送出使用者名稱準備登入
if (document.querySelector('#user-name').value) {
  const CHAT = window.CHAT
  CHAT.submitUserName()
}

// 私訊/群聊選項
document.querySelector('#private-check').onchange = () => {
  if (privateCheck.checked) { // 左側勾選才能私訊
    this.receiver.disabled = false // 勾選私訊才能輸入id
    this.content.disabled = true // 避免私訊模式沒輸入id也能群聊
    this.receiver.onchange = () => { // 監聽是否輸入id
      this.content.disabled = false // 輸入id後才能輸入私訊訊息
      if (!this.receiver.value) { // 如果使用者把id清空
        this.content.disabled = true // 禁用文字欄以免群聊
      }
    }
  } else { // 左側沒勾選就是群聊
    this.receiver.disabled = true // 避免輸入id變成私訊
    this.receiver.value = '' // 避免切換後id存留變成發出私訊
    this.content.disabled = false // 從私訊切換後直接啟用
  }
}

// 通過按“Enter”可提交訊息
document.querySelector('#content').onkeydown = (event) => {
  const CHAT = window.CHAT
  if (event.keyCode === 13) {
    CHAT.submit()
  }
}

// 避免意外離開聊天室，增加額外確認是否離開
window.onbeforeunload = () => {
  return 'Are you sure you want to leave?'
}
