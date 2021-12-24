# 餐廳評論網
---
## 這是什麼？
這是Alpha Camp的作業「餐廳評論網」<br>
目標是幫助網站使用者完成以下事情：
- 找到好餐廳
- 查看餐廳的基本資訊
因此，除了網站本身會提供豐富的餐廳資訊，我們也會建立使用者評論與收藏等互動功能，累積使用者的活動數據，讓值得推薦的好餐廳浮上檯面。
是存放作為前端串接資料、進行database操作的路由的repository。
<br>
連結：https://forum-ming.herokuapp.com/

---
## 有哪些功能？
**前台**
- 使用者可以註冊/登入/登出網站
- 使用者可以在瀏覽所有餐廳與個別餐廳詳細資料
- 在瀏覽所有餐廳資料時，可以用分類篩選餐廳
- 使用者可以對餐廳留下評論
- 使用者可以收藏餐廳
- 使用者可以查看最新上架的 10 筆餐廳
- 使用者可以查看最新的 10 筆評論
- 使用者可以編輯自己的個人資料
- 使用者可以查看自己評論過、收藏過的餐廳
- 使用者可以追蹤其他的使用者
- 使用者可以查看自己追蹤中的使用者與正在追蹤自己的使用者

**後台**
- 只有網站管理者可以登入網站後台
- 網站管理者可以在後台管理餐廳的基本資料
- 網站管理者可以在後台管理餐廳分類
---
## 具有哪些內容？
* 資料庫
  * config/config.js：設定對應本機SQL的username, password與database名稱
  * migrations：建立各個Model的Table時，預設之變數與資料型態
  * models：各個Model的變數與資料型態，及其與其他Model的關聯性
* 路由
  * config/passport.js：登入的驗證功能之設定
  * controllers/api：回傳來自services送來的資料或狀態
  * route/api.js：路由列表
  * services：每條路由所對應之database的CRUD
* 套件與其他
  * package.json：本repository所使用的套件和執行設定

---
## 使用技術
1. Node.js：讓JavaScript在伺服器端運行的執行環境
2. Express.js：基於Node.js來開發Web App的框架
3. Passport.js：採用JSON Web Token作為登入驗證的middleware套件
4. MySQL：用來儲存資料的關聯式資料庫
5. Heroku：部署Web App的雲端平台
---
## 怎麼使用？
1. 下載repository
    <pre><code>git clone -b main git@github.com:jadokao/forum-express-grading-1.git</code></pre>
2. 進入資料夾
    <pre><code>cd forum-express-grading-1</code></pre>
4. 進行套件下載
    <pre><code>npm install</code></pre>
4. 建立檔案：*.env*，並參考檔案：*.env.example*，放入環境變數
5. 至資料夾*config*裡的*config.json*，修改環境*development*內的*username*與*password*和本機的SQL資訊相符
6. 到SQL Workbench，輸入指令來建立database
    <pre><code>create database forum_new;</code></pre>
7. 建立Model的Table至database
    <pre><code>npx sequelize db:migrate</code></pre>
8. 載入種子檔
    <pre><code>npx sequelize db:seed:all</code></pre>
9. 輸入指令，運行server
    <pre><code>npm run dev</code></pre>
---
## 測試用帳號
* 前台測試帳號
  * account：user1
  * email：user1@example.com
  * password：12345678
* 後台測試帳號
  * account：root
  * email：root@example.com
  * password：12345678
---
