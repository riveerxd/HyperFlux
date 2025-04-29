# HyperFlux 📁

A modern, **secure** and **minimalistic** temporary file-sharing service built with **Next.js 14**, React and Tailwind CSS.  
---

## ✨ Features

| Category | Details |
| -------- | ------- |
| 🔒 **Security** | NextAuth-powered sign-in |
| 📤 **Uploads** | Drag-and-drop UI with progress bar & chunked uploads |
| 🔗 **Sharing Links** | Auto-expiring URLs (default 24 h – configurable) |
| 📊 **Analytics** | Per-file download count |
| 🌓 **Dark / Light Mode** | One-click theme toggle |
| 📱 **Responsive** | Optimised for desktop, tablet and mobile |

---

## 🛠️ Tech Stack

| Layer | Choice | Notes |
| ----- | ------ | ----- |
| **Frontend** | Next.js 14 (App Router) | Fully type-safe with TypeScript |
| **Styling** | Tailwind CSS&nbsp;+&nbsp;`shadcn/ui` |
| **Backend** | Next.js API Routes |
| **Database** | MySQL 8 + Prisma ORM | Single schema file |
| **Auth** | NextAuth.js | JWT |
| **Storage** | Local folder by default (`/app/uploads`) |

---

## 🔧 Environment Configuration

Create a file named **`.env.local`** in the project root:

```bash
# Database
DATABASE_URL="mysql://file_user:your_secure_password@localhost:3306/file_share"

# NextAuth
NEXTAUTH_SECRET="your-very-secure-secret"
NEXTAUTH_URL="http://localhost:3000"

# Upload directory
UPLOAD_DIR="/app/uploads"
```

---

## 🚀 Getting Started

```bash
# 1. Clone and install
git clone https://github.com/riveerxd/HyperFlux
cd HyperFlux
npm install

# 2. Configure environment
vim .env.local

# 3. Run Prisma migrations & generate types
npx prisma migrate dev
npx prisma generate

# 4. Start the server
npm run dev    # http://localhost:3000
```

---

## 📦 Build & Deploy

TODO: add build & deploy instructions
```bash
npm build
npm start
```

---


## 📝 License

no licence yet

---