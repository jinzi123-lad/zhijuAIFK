# Zhiju AI Real Estate System - Technical Architecture Standards

> **Version**: 1.0
> **Date**: 2025-12-19
> **Status**: Enforced

## 1. Core Data Strategy: Cloud-First (Cloud Only)
To ensure data consistency across all platforms and strict management control, the system adopts a **Strict Cloud Persistence** strategy.

### 1.1 Single Source of Truth
*   **Backend**: Supabase (PostgreSQL) is the **sole and authoritative** source of truth for all business data.
*   **Scope**: This applies to all client terminals, including:
    *   Web Management System (ERP)
    *   WeChat Mini Program (C-End / Agent-End)
    *   Mobile App (iOS / Android)

### 1.2 Data Persistence Rules
*   **✅ Allowed**:
    *   **Cloud Storage**: All business operations (Create/Update/Delete) must be directly committed to the Supabase database via API.
    *   **Session State**: UI state (e.g., current tab, active filters) may be kept in memory/session.
*   **❌ Strictly Prohibited**:
    *   **Local Business Data**: **DO NOT** store business entities (Properties, Users, Orders) in local storage mechanisms (e.g., `localStorage`, `AsyncStorage`, `SQLite`, `Realm`) as a primary store or "offline fallback" for critical data.
    *   **Offline edits**: Offline editing is currently **disabled** to prevent data conflict and synchronization issues.

## 2. Cross-Platform Implementation Guide

### 2.1 Backend Connection
All future client applications must connect to the shared Supabase instance:

*   **API Endpoint**: `https://jftfuycsttqinerhqoqw.supabase.co` (Production)
*   **Authentication**: Use Supabase Auth (JWT) for unified user identity across Web, App, and Mini Program.

### 2.2 Mini Program (WeChat) Specifications
*   **SDK**: Use `supabase-wechat-stable` (or compatible adapter).
*   **Network**: Add the Supabase URL to the WeChat Mini Program Admin Console "Request Legal Domains".
*   **User Sync**: Bind WeChat OpenID/UnionID to the `erp_users` table in Supabase via Edge Functions.

### 2.3 Mobile App (Flutter/React Native) Specifications
*   **SDK**: Use `@supabase/supabase-js` (React Native) or `supabase_flutter`.
*   **Behavior**:
    *   On App Launch: Fetch fresh data from API.
    *   On Action: Optimistic UI updates are permitted, but must rollback on API failure.
    *   **Error Handling**: If API fails, show "Network Error" to user. Do **not** failover to local save.

## 3. Data Integrity & Security
*   **Row Level Security (RLS)**: Must be enabled on Supabase to ensure users (Agents vs Admins) only access their authorized data, regardless of which client they use.
*   **Asset Storage**: Images/Videos must be uploaded to Supabase Storage buckets, storing only the **URL** in the database.

---
**Architectural Decision Record (ADR)**
*   **Decision**: Remove local storage fallback.
*   **Reasoning**: To prevent "Phantom Data" (data existing only on one device) and ensure that when an admin deletes a property, it disappears instantly from all devices.
*   **Compliance**: All future code contributions must check against this standard.
