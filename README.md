# signal-board
# 🔒 Startup Signalboard (Proprietary)

⚠️ **Legal Notice**: This is a proprietary project. All code is © Angus Hally and may not be reused, modified, or distributed without explicit written consent. See LICENSE for details.

**Startup Signalboard** is a private, multi-tenant application designed to help trusted startup collaborators, advisors, and scouts evaluate, share, and engage with early-stage startups.

> Built for personal use by [Angus Hally](https://www.angushally.com), this app powers dealflow visibility, startup evaluation, and networked discovery — all in one trusted space.

---

## 🚀 Purpose

The application serves two core goals:

1. **Personal Dashboard**  
   Curate and manage startups you're collaborating with, rating them using a structured evaluation framework.

2. **Networked Sharing**  
   Invite trusted friends and collaborators to explore your startup portfolio, comment, signal interest, and save startups to their own shortlist.

---

## 🔐 Current MVP Scope

### ✳️ Features

- **Public Startups Feed** (`/startups`) - Browse all public startups with ratings and creator info
- Secure login (multi-user ready, with private dashboards)
- Add, edit, and delete your own startup listings
- Rate each startup across 6 dimensions (1-5 scale):
  - Market & Demand
  - Solution & Execution
  - Team & Founders
  - Business-Model Viability
  - Validation & Traction
  - Environment & Runway
- Public comment threads per startup
- Express interest in a startup (logged to dashboard)
- Public activity feed of startups shared by other users
- Profile-based attribution of comments and ratings

### 🗂️ Data Model Summary

- `users`: Authenticated accounts (Supabase-managed)
- `startups`: Curated startup listings per user
- `startup_ratings`: Structured multi-dimensional ratings per startup
- `startup_engagements`: Interest signals, saves, and comments
- `follows`: Social graph for personalized discovery

### 📚 Tech Stack

- **Frontend**: Next.js + Tailwind
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Hosting**: Vercel
- **Auth**: Email or magic link

---

## 🔮 Future Enhancements

- “Inner Circle” visibility for private ratings/comments
- Notifications for new activity on your startups
- Public/private toggle per startup or comment
- Founder-managed startup profiles
- Shortlisting, bookmarking, and collection curation
- Invite workflows & startup access permissions
- Custom engagement dashboards for each user

---

## 🧠 Evaluation Framework

All startups are assessed using the Hally Six-Dimensional Framework:

| Dimension               | Focus                                                       |
|-------------------------|-------------------------------------------------------------|
| Market & Demand         | Pain-point validation, TAM/SAM/SOM, willingness-to-pay      |
| Solution & Execution    | Technical feasibility, roadmap, partnerships                |
| Team & Founders         | Grit, domain expertise, complementary skills, network       |
| Business Model Viability| Unit economics, pricing strategy, GTM channel fit           |
| Validation & Traction   | Revenue, pilots, usage, investor interest                   |
| Environment & Runway    | Timing, legal/regulatory context, funding path              |

---

## 👤 License & Ownership

This codebase is **proprietary** and not for public distribution.

All rights reserved © 2025 Angus Hally.

For collaboration inquiries, contact: `hello@angushally.com`

---

## 🛠 Dev Setup

> When you're ready to build locally:

```bash
git clone <private-repo-url>
cd startup-signalboard
npm install
npm run dev

Make sure your .env.local includes the correct Supabase credentials.

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

🙌 Credits
Originally prototyped using bolt.new. MVP powered by Supabase & Vercel.

