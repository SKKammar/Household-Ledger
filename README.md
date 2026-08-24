<div align="center">
  <h1>📖 Household Ledger</h1>
  <p><strong>A minimalist, paper-themed expense tracker for roommates and households.</strong></p>
  <p>
    <img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=Svelte&logoColor=white" alt="SvelteKit" />
    <img src="https://img.shields.io/badge/Turso-4EE89F?style=for-the-badge&logo=turso&logoColor=black" alt="Turso" />
    <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

<br/>

## 🎯 What is Household Ledger?

Household Ledger is a lightweight, edge-ready web application designed specifically to eliminate the friction of tracking shared household expenses. Built with an elegant "1970s paper ledger" aesthetic, it offers a beautifully simple interface to log bills, track who owes what, and split costs.

No passwords, no complex accounting software—just magic links and clear monthly statements.

---

## ✨ Features

- 🔐 **Passwordless Magic Links**: Secure, instant login via email using Brevo. No passwords to forget.
- 🏠 **Multi-Household Support**: Use the same email address across multiple households with a seamless context-switching login flow.
- 💸 **Expense Splitting**: Log an expense and instantly split it equally among selected housemates.
- 📊 **Monthly Statements**: View your "Net Share" vs "Total Paid" at a glance.
- 🔒 **Tamper-Proof Records**: Expenses from past months are permanently locked and cannot be edited.
- 👑 **Admin Controls**: Dedicated Admin panel to invite/remove members, manage custom household expense categories, or securely reset the entire ledger.
- 🎨 **1970s Ledger Aesthetic**: A clean, distraction-free UI utilizing a specialized paper-and-ink color palette and typewriter fonts.

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **SvelteKit** | Core framework (SSR, Routing, UI) |
| **Turso (LibSQL)** | Edge SQLite Database for sub-millisecond queries |
| **Drizzle ORM** | Type-safe database schema management and querying |
| **Brevo v6** | Transactional email delivery (Magic Links) |
| **Vercel** | Edge deployment and hosting |

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- A free [Turso Database](https://turso.tech/) account
- A free [Brevo](https://www.brevo.com/) account (for emails)

### 2. Environment Setup
Create a `.env` file in the root directory and populate it with your credentials:

```env
# Database
TURSO_DATABASE_URL="libsql://your-db-url.turso.io"
TURSO_AUTH_TOKEN="your-turso-token"

# Authentication / Security
SESSION_SECRET="your-64-character-random-secret"
PUBLIC_APP_URL="http://localhost:5173"

# Brevo Emails (Magic Links)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="your.verified@email.com"
BREVO_SENDER_NAME="Household Ledger"
```

> **Note:** During local development (`NODE_ENV=development`), the application will **not** send actual emails to save your Brevo API quota. Instead, it will print the secure magic login link directly to your terminal!

### 3. Installation & Run

```bash
# Install dependencies
npm install

# Push the database schema to Turso
npm run db:push

# Start the development server
npm run dev
```

Visit `http://localhost:5173/setup` to create your initial Admin account and bootstrap the household!

---

## ☁️ Deployment (Vercel)

Household Ledger is completely optimized for **Vercel Edge deployments**. 

1. Push your repository to GitHub.
2. Import the project in your Vercel Dashboard.
3. Under **Environment Variables**, add all the variables from your `.env` file.
   - *Crucial: Ensure `PUBLIC_APP_URL` is set to your live Vercel domain (e.g., `https://my-ledger.vercel.app`).*
4. Click **Deploy**.

> ⚠️ **Windows Build Warning**: If you run `npm run build` locally on Windows, you may encounter an `EPERM: symlink` error from the `@sveltejs/adapter-vercel` package. **This is normal and safe to ignore.** It is a Windows-specific local quirk; the build will run flawlessly when deployed to Vercel's Linux cloud infrastructure.

---

## 🔐 Security & Design Rules

- **Strict Isolation**: Users can only edit or delete their *own* expenses.
- **Time Locks**: The application strictly enforces month-locking. Once a month rolls over, expenses from that month become immutable.
- **Cross-Origin Magic Links**: Built with `SameSite: Lax` cookie policies to flawlessly handle magic-link redirects directly from mobile email clients like Gmail and Outlook. 

---

<div align="center">
  <i>Built with ❤️ by Antigravity.</i>
</div>
