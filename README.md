# SheetLab — Minimal Real-Time Collaborative Spreadsheet

A lightweight collaborative spreadsheet built with **Next.js 14 App Router**, **TypeScript (strict)**, **Tailwind CSS**, and **Firebase (Firestore + Auth)**.

<img width="1612" height="867" alt="image" src="https://github.com/user-attachments/assets/86f4a5f4-f816-4c88-a0a2-423901fd9c83" />
<img width="1917" height="777" alt="image" src="https://github.com/user-attachments/assets/506b7a5d-e6a5-4e28-95eb-d1e756a2e7f8" />
<img width="1917" height="788" alt="image" src="https://github.com/user-attachments/assets/12bcb939-f63e-4a7f-a412-1ec21433343c" />
<img width="1918" height="803" alt="image" src="https://github.com/user-attachments/assets/26f0643b-b8fe-43b8-b8a7-49aad360ad18" />





---

## Architecture Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Framework | Next.js 14 App Router | Co-locates pages and server/client boundary control |
| State | React `useState` + Firestore listeners | No extra global store needed; Firestore IS the source of truth |
| Auth | Firebase Auth (Google) + localStorage guest | Covers both authenticated and anonymous workflows |
| Styling | Tailwind CSS | Utility-first, zero config, dark-mode-friendly |
| Real-time | `onSnapshot` per document | Granular — only the open document's cells are subscribed |

**No Redux / Zustand / React Query** — the Firestore listeners handle reactivity directly, keeping the stack minimal.

---

## Project Structure

```
src/
  types/spreadsheet.ts      # All shared TypeScript types + constants
  lib/
    firebase.ts             # App init (singleton-guarded)
    formulas.ts             # Formula evaluator
    colors.ts               # Deterministic color from UID
  context/
    UserContext.tsx          # Auth state (Google + guest), exposed via useUser()
  hooks/
    useDocument.ts           # Firestore real-time cell listener + updateCell
    usePresence.ts           # Heartbeat writer + presence subscriber
  components/
    LoginPage.tsx            # Google / guest sign-in UI
    SpreadsheetGrid.tsx      # 26×50 scrollable grid (React.memo)
    Cell.tsx                 # Individual cell — select / edit / display
    Presence.tsx             # Active collaborator avatars
app/
  layout.tsx                 # Root layout — wraps children in <UserProvider>
  page.tsx                   # Dashboard — document list + create
  doc/[id]/page.tsx          # Spreadsheet editor
```

---

## Data Model (Firestore)

```
documents/{docId}
  title: string
  createdBy: string          # UID
  authorName: string
  updatedAt: Timestamp

documents/{docId}/cells/{cellId}
  value: string              # Display/stored value
  formula?: string           # Raw formula (e.g. "=A1+B1")
  updatedBy: string          # UID of last editor
  updatedAt: Timestamp

documents/{docId}/presence/{userId}
  name: string
  color: string              # Hex color
  lastActive: number         # Unix ms — used to filter stale entries
```

Cell IDs use spreadsheet notation: `A1`, `B2`, `Z50`.

---

## Formula Engine Design (`src/lib/formulas.ts`)

Intentionally **minimal** — no AST, no dependency graph, no circular-reference detection.

### Supported Syntax

| Formula | Example |
|---|---|
| Addition | `=A1+B1` |
| Subtraction | `=A1-B1` |
| Multiplication | `=A1*B1` |
| Division | `=A1/B1` |
| SUM range | `=SUM(A1:A5)` |

### How It Works

1. `evaluateFormula(formula, cellValueMap)` receives a pre-built flat map of `cellId → string value`.
2. It regex-matches either a `SUM(range)` pattern or a single `LEFT OP RIGHT` binary expression.
3. Referenced cell values are parsed with `parseFloat`, defaulting to `0` for non-numeric content.
4. Division by zero returns `#DIV/0!`; unrecognized formulas return `#ERROR!`.

The cell value map passed in must already be computed (no recursive evaluation). This means nested formulas like `=SUM(A1:A3)` where individual cells also contain formulas **are not resolved transitively** — a known limitation.

---

## Real-Time Strategy

- **One `onSnapshot` per open document** (cells subcollection).
- All tabs subscribed to the same document receive updates within ~200ms from Firestore's push infrastructure.
- React `memo` on `SpreadsheetGrid` prevents the entire grid re-rendering when only a single cell changes.
- Presence is maintained via a **heartbeat** written every 20 seconds; entries older than 60 seconds are hidden from the UI.

---

## Identity & Colors

- **Google sign-in** via `signInWithPopup` — standard Firebase Auth flow.
- **Guest mode** — a `uuid` is generated and stored in `localStorage` alongside the chosen display name. The user is treated identically to an authenticated user for all real-time features.
- Colors are assigned **deterministically** from the user's UID using a hash → palette lookup, so the same user always gets the same color across sessions.

---

## Limitations & Intentionally Omitted Features

| Feature | Status |
|---|---|
| Nested formula evaluation | ❌ Not implemented — cells used in formulas must contain raw numbers |
| Named ranges | ❌ Not implemented |
| Formatting (bold, color) | ❌ Not implemented |
| Column/row resize | ❌ Fixed widths only |
| Undo / redo | ❌ Not implemented |
| Offline support | ❌ Firestore persistence not enabled |
| Row/column insert/delete | ❌ Fixed 26×50 grid |
| Formula bar | ❌ Editing happens directly in the cell |
| Conflict resolution | ✅ Last-write-wins via Firestore's atomic `setDoc` |
| Sharing / permissions | ❌ All documents are public to all signed-in users |
| Tests | ❌ No unit tests — out of scope for assignment |

---

## Getting Started

### 1. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore** and **Authentication → Google provider**
3. Copy your web app credentials

### 2. Environment Variables

Copy `.env.local` and fill in your Firebase config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Firestore Security Rules (recommended)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{docId} {
      allow read, write: if request.auth != null;
      match /cells/{cellId} {
        allow read, write: if request.auth != null;
      }
      match /presence/{userId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 4. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
Live Link : https://trade-markia-assignment.vercel.app/

Explantion Videos : https://www.loom.com/share/dc67dba0ed2644559426530222d9dfd4     https://www.loom.com/share/cd836c22e3e64e3b997b0d5c8c6d5717

