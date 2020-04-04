# Simple Twitter v1.0.0 (簡易推特，第一版)

## ALPHA Camp 全端網路開發課程，學期四期中分組作業
(具有簡易使用者線上交流功能，類似 Twitter 的社群網站)
- 免安裝預覽連結：[https://twitter2020.herokuapp.com/](https://twitter2020.herokuapp.com/)

## 協作者：
- [duaifzn](https://github.com/duaifzn)（組長）
註冊與登入功能/使用者個別資訊頁面/推文留言個別資訊頁面/首頁使用者推薦名單/即時通知（小鈴鐺）功能/主要功能檢查與修復/執行專案自動化測試與佈署/master主分支與pull request管理
- [BOBYZH](https://github.com/BOBYZH)（協同開發）
後台推文與使用者清單頁面/前台推文瀏覽頁面/使用者個別資訊排序/使用者個人資訊編輯頁面/線上即時對話（含私訊）功能/雜項功能添加與修復/UI與UX調整/readme.md撰寫
- [ctli1993](https://github.com/ctli1993)（專案管理）
使用者追蹤與推文收藏功能/其他使用者資訊頁面/個人與其他使用者資訊頁面區別/推文與留言頁面功能/打卡功能/專案任務分配與報告/支援功能修復

## 如何使用：
0. 至少先在電腦上裝好Node.js、Git、MySQL Community  Server([依作業系統版本對照說明操作](https://dev.mysql.com/downloads/mysql/))
1. 從本專案頁面將檔案下載，或複製(clone)到要操作的電腦上:
```
git clone https://github.com/duaifzn/simple-twitter-express-starter.git
```
2. 開啟終端機(terminal)，將目錄切換至專案資料夾(simple-twitter-express-starter)：
```
cd simple-twitter-express-starter
```
3. 確認是否有在全域(global)環境安裝nodemon；沒有的話建議安裝，在終端機輸入：
```
npm i nodemon -g
```
4. 使用npm安裝需要的套件，套件列表與版本詳見於[package.json](https://github.com/duaifzn/simple-twitter-express-starter/blob/master/package.json)的"dependencies"：
```
npm i 
```
5. 可使用migrate與seeder建立資料庫與範例資料，供快速檢視功能：
```
npx sequelize db:migrate
npx sequelize db:seed:all
```
以下為測試用的「正確」使用者名稱與對應的帳密：

|(name) | email              | password | 帳戶類別     |
| ------| -------------------| ---------| --------------------|
| root | root@example.com  | 12345678 | 管理員 |
| user1 | user1@example.com  | 12345678 | 使用者 |
| user2 | user2@example.com  | 12345678 | 使用者 |
| dabon| duaifzn@gmail.com  | aaa| 管理員 |
6. 若要測試圖片上傳與Google地圖打卡功能，需到[imgur](https://imgur.com/signin?redirect=https%3A%2F%2Fapi.imgur.com%2Foauth2%2Faddclient)與[Google Maps Platform](https://cloud.google.com/maps-platform/?utm_source=google&utm_medium=cpc&utm_campaign=FY18-Q2-global-demandgen-paidsearchonnetworkhouseads-cs-maps_contactsal_saf&utm_content=text-ad-none-none-DEV_c-CRE_267331380202-ADGP_Hybrid+%7C+AW+SEM+%7C+BKWS+~+%5B1:1%5D+%7C+TW+%7C+EN+%7C+BK+%7C+EXA+%7C+Google+Maps+Api-KWID_43700014353952976-kwd-335425467-userloc_1012825&utm_term=KW_google%20maps%20api-ST_google+maps+api&gclid=CjwKCAjwvZv0BRA8EiwAD9T2VTD8wG5u8mZqTkWhmCJ86XZAkzQNFqsmV-dR8szCDxRPxoXP8PHQ6RoCL-gQAvD_BwE)，申請對應的id/key
7. 可在本專案根目錄依據[.env.template](https://github.com/duaifzn/simple-twitter-express-starter/blob/master/.env_template)內容格式，新增".env"檔案(可使用終端機指令)，並在.env填入id或key
```
cp .env.template .env
```

8. 執行本專案：
```
npm run dev

# 不使用nodemon的話，可改用以下指令，但無法在修改代碼後即時更新：
npm run start
```
9. 開啟預覽連結
- 若是在本機操作，於瀏覽器網址列輸入[http://localhost:3000](http://localhost:3000)（終端機也會有提示）；
- 若使用虛擬主機，則須配合主機服務設定另用網址
- 另有[http://localhost:8080](http://localhost:8080)作為本地WebSocket伺服器測試，可以將[./views/chat/chat.js](https://github.com/duaifzn/simple-twitter-express-starter/blob/master/views/chat/chat.js)中的106行替換為105行來使用；無針對此技術在本地詳細測試的話可忽略

## 主要功能說明：

### 註冊/登入/登出
使用Bootstrap美化與規劃版面
#### 除了註冊和登入頁，使用者一定要登入才能使用網站
#### 註冊時，使用者可以創建帳號，並設定名稱、信箱與密碼
#### 註冊時，使用者的名稱和 email 不能重覆，若有重覆會跳出錯誤

### 前台
使用Bootstrap美化與規劃版面
#### 使用者能瀏覽所有的推播 (tweet)
#### 使用者能在首頁看見跟隨者 (followers) 數量排列前 10 的使用者推薦名單
#### 點擊其他使用者的名稱時，能瀏覽該使用者的個人資料及推播
#### 使用者能新增推播
- 推播字數限制在 140 以內，且不能為空白
- 若不符合規定，會跳回同一頁並顯示錯誤訊息
#### 使用者能回覆別人的推播
- 回覆文字不能為空白
- 若不符合規定，會跳回同一頁並顯示錯誤訊息
#### 使用者可以追蹤/取消追蹤其他使用者 (不能追蹤自己)
#### 使用者能對別人的推播按 Like/Unlike
#### 任何登入使用者都可以瀏覽特定使用者的以下資料：
- Tweets：排序依日期，最新的在前
- Following：該使用者的關注清單，排序依照追蹤紀錄成立的時間，愈新的在愈前面
- Follower：該使用者的跟隨者清單，排序依照追蹤紀錄成立的時間，愈新的在愈前面
- Like：該使用者 like 過的推播清單，排序依 like 紀錄成立的時間，愈新的在愈前面
#### 使用者能編輯自己的名稱、介紹和大頭照

### 後台
管理者登入網站後，能夠經由瀏覽列進入後台頁面 (只有管理員能看見後台入口)

在後台介面：
使用Font Awesome圖示化按鈕
#### 管理者可以瀏覽全站的推播清單
- 可以直接在清單上快覽推播回覆內容前 50 個字
- 可以在清單上刪除使用者的推播
#### 管理者可以瀏覽站內所有的使用者清單，清單的資訊包括
- 使用者社群活躍數據，包括推播數量、關注人數、跟隨者人數、推播被 like 的數量)
- 清單預設按推播文數排序

### 額外功能
#### 線上即時對話
- 使用socket.io即時通訊與Font Awesome圖示化按鈕
- 可與同時進入聊天室頁面的其他使用者，在線上即時發送文字訊息與所有人聊天
- 可以輸入對方id「私訊」其他人（含自己）
- 輸入電話號碼/常見網址/電子郵件地址會自動轉換為超連結
#### 即時通知 (小鈴鐺)
- 使用express-ws即時通訊與Font Awesome圖示化按鈕
- 可即時接收追蹤用戶的新推文提醒
- 針對想要追蹤的用戶，追蹤之後，只要有新的貼文動態，不需要刷新網頁，就會收到「通知」
- 保留在畫面右上角的小鈴鐺，點擊即可查看
#### 打卡
- 使用Google Maps API載入地理資訊
- 可標注推文所在的地圖位置
- 串接 Google Maps 的地標，以關鍵字搜尋地點
- 或使用自定義文字標注推文狀態
#### 響應式網頁設計（RWD）支援
- 使用Bootstrap與CSS Media Query編排畫面元素
- 所有頁面會應瀏覽器/設備螢幕大小調整版面
- 對常見高解析度顯示器/桌上型電腦/筆記型電腦/平板/手機皆有而外調校
- 聊天室對話框也會因應畫面調整高度，輸入欄位固定在下方，不會跑到螢幕外

## 版本歷程：
- 2020.04.04：第一版，完成所有基本功能與指定/自選挑戰功能，並修復已知錯誤與優化UI/UX