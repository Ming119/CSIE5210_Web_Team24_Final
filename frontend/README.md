# 社團管理系統 (Club Management System)

一個基於 React + TypeScript + Vite 開發的社團管理平台，專為台灣大學社團活動管理而設計。

## 🛠️ 技術架構

- **前端框架**: React 19.1.0
- **開發語言**: TypeScript 5.8.3
- **建置工具**: Vite 6.3.5
- **樣式框架**: Bootstrap 5.3.6
- **路由管理**: React Router DOM 7.6.0
- **程式碼檢查**: ESLint 9.25.0

## 📋 系統需求

在開始之前，請確保您的系統已安裝：

- **Node.js**: 版本 18.0.0 或更高
- **npm**: 版本 9.0.0 或更高（通常隨 Node.js 一起安裝）

### 檢查版本方法

```bash
node --version
npm --version
```

## 🚀 安裝與啟動

### 1. 下載專案

```bash
# 使用 Git 複製專案（如果有 Git 倉庫）
git clone <repository-url>
cd club-management

# 或者解壓縮專案檔案到指定資料夾
```

### 2. 安裝相依套件

```bash
npm install
```

這個步驟會安裝 `package.json` 中列出的所有相依套件，包括：

- React 相關套件
- TypeScript 編譯器
- Vite 建置工具
- Bootstrap CSS 框架
- ESLint 程式碼檢查工具

### 3. 啟動開發伺服器

```bash
npm run dev
```

成功啟動後，您會看到類似以下的訊息：

```
  VITE v6.3.5  ready in 500ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. 開啟瀏覽器

在瀏覽器中開啟 `http://localhost:5173/` 即可看到應用程式。

## 📁 專案結構

```
club-management/
├── public/                 # 靜態資源
│   └── vite.svg
├── src/                    # 原始碼
│   ├── components/         # React 元件
│   │   ├── Header.tsx      # 頁面標題列
│   │   ├── ClubList.tsx    # 社團列表
│   │   ├── ClubCard.tsx    # 社團卡片
│   │   ├── ClubDetail.tsx  # 社團詳情
│   │   ├── MyClubs.tsx     # 我的社團
│   │   ├── ActivityDetail.tsx # 活動詳情
│   │   ├── CreateClubForm.tsx # 建立社團表單
│   │   └── Pagination.tsx  # 分頁元件
│   ├── models.ts          # 資料模型定義
│   ├── api.ts             # API 服務層
│   ├── App.tsx            # 主要應用元件
│   ├── App.css            # 應用樣式
│   ├── index.css          # 全域樣式
│   └── main.tsx           # 應用程式入口
├── index.html             # HTML 模板
├── package.json           # 專案設定檔
├── tsconfig.json          # TypeScript 設定
├── vite.config.ts         # Vite 設定
└── README.md              # 專案說明文件
```

## 🎮 使用說明

### 社團瀏覽

1. 首頁顯示所有社團列表
2. 點擊社團卡片查看詳細資訊
3. 可以申請加入感興趣的社團

### 社團管理

1. 點擊右上角「登入/註冊」（模擬登入）
2. 進入「我的社團」頁面管理您參與的社團
3. 可以建立新社團或管理現有社團

### 活動管理

1. 在社團詳情頁面中，社長可以新增活動
2. 設定活動資訊、日期、費用等
3. 選擇付款方式和負責人

## 🔧 開發指令

```bash
# 啟動開發伺服器
npm run dev
```
