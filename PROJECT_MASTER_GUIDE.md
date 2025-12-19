# 🧞‍♂️ Zhiju AI Real Estate System - Project Master Guide

> **⚠️ TO FUTURE AI AGENTS**: 
> This document is the **Single Source of Truth** for the project.
> **MANDATORY PROTOCOL**:
> 1. **READ FIRST**: You MUST read this document at the start of every session to understand context and preferences.
> 2. **SYNC UPDATES**: Any new user requirement or architectural change MUST be recorded here immediately.
> 3. **STRICT COMPLIANCE**: Follow the "User Requirements" section below without deviation.

---

## 7. User Requirements & Preferences (Living Section)
> **Goal**: Build a "Premium, Cloud-Native, AI-Powered" Real Estate ERP.

### 7.1 Core Commandments
1.  **Strict Cloud Persistence**: **NO** local storage for business data. All data must live in Supabase. If the network fails, the operation fails (do not fake success).
2.  **Multi-Platform Vision**: The backend must support future extensions to **WeChat Mini Programs** and **Mobile Apps**. API consistency is key.
3.  **Language**: All UI and Agent communication must be in **Simplified Chinese (简体中文)**.
4.  **Design Philosophy**:
    *   **Aesthetics**: Premium, High-End, "Wow" effect. Use simple but elegant colors (modern ERP style).
    *   **No Placeholders**: Do not use "Lorem Ipsum". Use AI to generate realistic demo content (managed by `seeder.ts`).

### 7.2 Working Preferences
*   **Documentation**: Keep this file updated. The user values documentation highly.
*   **Proactivity**: If you see a potential future issue (e.g., storage limits, security risks), warn the user immediately.
*   **Transparency**: Explain *why* a solution was chosen (e.g., "Why use Storage Policies?").

## 8. Critical "Watch Outs" (Lessons Learned)
*   **🚫 Image Uploads**: NEVER save `blob:http://...` URLs to the database. They die when the tab closes. You MUST upload to Supabase Storage and save the returned `publicUrl`.
*   **⚠️ Vercel Deployment**: Keys starting with `VITE_` are exposed to the browser. This is **Safe and Required** for Supabase Anon Keys, but explain it to the user if Vercel warns them.
*   **⚠️ TypeScript**: Vercel deployment will ABORT if there are any TypeScript errors. Always run `npm run build` locally before confirming a fix.
*   **⚠️ Empty States**: If the DB is fresh, the App should seamlessly auto-seed demo data so the user doesn't see a blank screen.

---

## 1. Project Overview
**Zhiju AI (智居AI)** is a modern real estate ERP system integrated with AI capabilities.
*   **Type**: Single Page Application (SPA) / SaaS
*   **Core Philosophy**: **Cloud-First**. All data must persist in the backend database. Local storage is strictly for session cache only, never for business data.

## 2. Technical Stack (Frontend)
*   **Build Tool**: Vite 5.x
*   **Framework**: React 18 (TypeScript)
*   **Styling**: Tailwind CSS 3.4
*   **Maps**: Leaflet (OpenStreetMap/Gaode Tiles)
*   **AI Integration**: Google Gemini (via `@google/genai`)
*   **Entry Point**: `App.tsx` (Main Logic), `main.tsx` (DOM Mount)
*   **Critical Commands**:
    *   `npm run dev`: Start local dev server (default port 5173).
    *   `npm run build`: Type-check (`tsc`) and build (`vite build`) for production.

## 3. Backend Architecture (Supabase)
The system relies entirely on **Supabase** (PostgreSQL) for all persistence.
*   **Project URL**: `https://jftfuycsttqinerhqoqw.supabase.co`
*   **Key Security Model**:
    *   **Anon Key**: Safe for frontend usage. Used for connection.
    *   **RLS (Row Level Security)**: Controls actual data access permissions.
*   **Core Tables**:
    *   `properties`: Real estate listings.
    *   `erp_users`: System users (Agents, Admins).
    *   `clients`: Customer CRM data.
    *   `orders`: Transaction records.
*   **Storage (Files)**:
    *   **Bucket**: `properties` (Public).
    *   **Usage**: Property images/videos are uploaded here directly via `services/storageService.ts`.
    *   **Policy**: Must allow Public SELECT/INSERT (configured via `storage_policy_setup.sql`).

## 4. Environment Configuration (Secrets)
### 4.1 Local Development
Strictly requires a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://jftfuycsttqinerhqoqw.supabase.co
VITE_SUPABASE_KEY=eyJhbGci... (Full Anon Key)
```

### 4.2 Production (Vercel)
Environment variables are **NOT** committed to Git. They must be set in Vercel Dashboard:
*   Project Settings -> Environment Variables.
*   **Required Variables**:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_KEY`

## 5. Deployment Pipeline (Vercel)
*   **Platform**: Vercel
*   **Trigger**: Automatic deploy on `git push` to `main` branch.
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Troubleshooting**:
    *   **TypeScript Errors**: If build fails, run `npm run build` locally to diagnose. Vercel will reject builds with TS errors.
    *   **Runtime Errors**: If app loads but shows "Database Error", check Vercel Environment Variables.

## 6. Recent Architectural Decisions (History)
*   **2025-12-19 (Persistence)**: Removed all `localStorage` fallback logic. If DB is offline, app must error out to prevent data inconsistency.
*   **2025-12-19 (Storage)**: Switched from `blob:` URLs to Supabase Storage. Users must create the `properties` bucket.
*   **2025-12-19 (Auto-Seed)**: `services/db.ts` will auto-inject demo data if `properties` table is empty on load.

---
**End of Guide**
*Last Updated: 2025-12-19*
