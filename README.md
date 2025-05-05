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

Create a file named **`.env`** in the project root:

```bash
# Database
DATABASE_URL="mysql://file_user:your_secure_password@localhost:3306/file_share"

# NextAuth
NEXTAUTH_SECRET="your-very-secure-secret"

# Upload directory
UPLOAD_DIR="/app/uploads"
```

---

Here's a polished, visually appealing, and user-friendly version for your README:

---

## 🚀 Getting Started

Follow these steps to quickly get HyperFlux up and running locally:

### 📋 Prerequisites

Make sure you have the following installed on your system:

* **Node.js** (Recommended: v18 or higher)
* **npm** (bundled with Node.js)
* **MySQL** (v8+)

### 🛠️ Setup Instructions

### 1. 🔧 Set Up the Database

Open your MySQL terminal and execute these commands to create your database and user:

```sql
CREATE DATABASE file_share;
CREATE USER 'file_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON file_share.* TO 'file_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. 📥 Clone and Install Dependencies

Clone the repository and install dependencies:

```bash
git clone https://github.com/riveerxd/HyperFlux
cd HyperFlux
npm install
```

### 3. ⚙️ Configure Environment Variables

Edit your `.env` file to match your database credentials and other environment settings:

```bash
vim .env
```

Example configuration:

```bash
DATABASE_URL="mysql://file_user:your_secure_password@localhost:3306/file_share"
```


### 4. 🚧 Run Prisma Migrations

Apply the Prisma schema migrations to your database:

```bash
npx prisma migrate deploy
```


### 5. 🚀 Launch the Server

Start the development server:

```bash
npm run dev
```

Your server will now be accessible at:

* 🌐 **[http://localhost:3000](http://localhost:3000)**


### 6. ⚙️ Performance optimization

Run the preloadscript.sh for maximum performace

```bash
./preloadscript.sh
```

---



## 📝 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/riveerxd/HyperFlux/blob/main/LICENSE) file for details.

---