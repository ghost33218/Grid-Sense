<div align="center">

# gridsense

**AI Traffic Operations Co-pilot for Bangalore**

Predict congestion severity · Deploy officers intelligently · Learn from past incidents

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-grid--sense--gridsense.vercel.app-C84B2F?style=flat-square)](https://grid-sense-gridsense.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![F1 Score](https://img.shields.io/badge/F1_Score-0.640-C84B2F?style=flat-square)](https://github.com/Tanmay2006-Tech/Grid-Sense)
[![High Risk Recall](https://img.shields.io/badge/High_Risk_Recall-75.5%25-2D6A4F?style=flat-square)](https://github.com/Tanmay2006-Tech/Grid-Sense)
[![Engineered Features](https://img.shields.io/badge/Engineered_Features-63-B8820A?style=flat-square)](https://github.com/Tanmay2006-Tech/Grid-Sense)
[![Incidents](https://img.shields.io/badge/Incidents-8%2C173-1A1A18?style=flat-square)](https://github.com/Tanmay2006-Tech/Grid-Sense)

*Gridlock Hackathon 2.0 · Theme 2 — Bangalore Traffic Intelligence*

</div>

---

## What is GridSense?

GridSense is an **operational decision-support dashboard** built for Bangalore Traffic Police. It ingests 8,173 historical traffic incidents (Jan–May 2024), predicts congestion severity (Low / Medium / High) for incoming events, and generates actionable deployment recommendations — officer counts, barricades, and diversion routes — backed by cosine similarity matching and a continuous officer feedback loop.

> **Every panel works.** Real API data when the backend is up; curated demo fallback data when it's not. Never empty charts, never dead buttons.

**[→ Try the live demo](https://grid-sense-gridsense.vercel.app)**

---

## Key Features

| Capability | What it does |
|---|---|
| **City Risk Index** | Composite SVG dial scoring city-wide risk from active events, road closures, and corridor severity |
| **Congestion Prediction** | 3-model ensemble (LightGBM · CatBoost · XGBoost) classifies severity and recommends resources |
| **Explainable AI** | Contributing factors panel shows *why* the model reached its prediction |
| **Similarity Search** | Cosine distance across 63 normalized features surfaces the 3 most similar past incidents |
| **What-If Simulation** | Side-by-side comparison of scenarios (road closure on/off, planned vs unplanned) |
| **Officer Feedback Loop** | Ground-truth corrections from field officers feed back to improve model accuracy over time |
| **Incident Map** | Leaflet map with duration-classified hotspot markers; fly-to animation on list click |
| **Resource Optimizer** | Shows officer savings vs fixed-rule baseline deployment |

---

## Demo

**One-click judge demo** — click **▶ LOAD JUDGE SCENARIO** in the sidebar. This navigates to `/predict`, auto-fills a *Public Event – Mysore Road* scenario, fires a real `POST /predict` call, and populates the result panel with live model output.

```
Dashboard → Map → Predict → Similarity → Feedback → About
    ↓           ↓        ↓            ↓          ↓         ↓
Risk Dial   Hotspots  Recs + Sim   Top-3      Accuracy  Metrics
```

| Step | Route | What to look for |
|------|-------|-----------------|
| **01** | `/` | City Risk Index dial, live alert feed, incident ticker |
| **02** | `/map` | Duration-classified markers, fly-to on list click |
| **03** | `/predict` | Scenario pill → result panel → What-If simulation |
| **04** | `/similar` | Cosine similarity across 63 features |
| **05** | `/feedback` | Officer ground-truth → accuracy gauge update |
| **06** | `/about` | F1, recall, model objective, dataset provenance |

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** (workspace uses pnpm exclusively)

### Install & Run

```bash
# From monorepo root
pnpm install

# From the GridSense package
cd artifacts/gridsense

# Required
set PORT=5173
set BASE_PATH=/

# Optional — override ML backend
set VITE_API_URL=https://gridsense-backend-tp2m.onrender.com

pnpm dev
```

Open **http://localhost:5173**

### Build for Production

```bash
set PORT=5173
set BASE_PATH=/
pnpm build
pnpm serve
```

---

## AI Architecture

Three gradient boosting models vote on congestion severity, weighted by their validation performance on this domain:

```
8,173 incidents → 63 engineered features
                         ↓
          ┌──────────────┼──────────────┐
     LightGBM (30%)  CatBoost (40%)  XGBoost (30%)
          └──────────────┼──────────────┘
                  Weighted ensemble
                         ↓
              Severity level + Deployment recs
                         ↓
              Officer feedback → model refinement
```

### Model Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| F1 Score (macro) | **0.640** | Stratified 80/20 hold-out |
| Accuracy | **63.8%** | Secondary to recall |
| High-risk recall | **75.5%** | Primary optimization target |
| Features | **63** | Domain-engineered per incident |

**Design philosophy:** Maximize recall on HIGH-risk incidents at the cost of additional false positives. Missing a critical event is operationally costlier than over-preparing.

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | **Dashboard** | City Risk Index, analytics charts, incident log |
| `/map` | **Incident Map** | Leaflet map with classified hotspot markers |
| `/predict` | **Predict Event** | Form + deployment recommendations + What-If simulation |
| `/similar` | **Similarity Search** | Top-3 historical matches by feature cosine distance |
| `/feedback` | **Officer Feedback** | Submit outcomes, view accuracy history |
| `/about` | **About** | Problem, solution, architecture, metrics |

Mobile: bottom nav bar (Dashboard · Predict · Map · Similarity · About) at `< 768px`.

---

## API

Backend: `https://gridsense-backend-tp2m.onrender.com` (override with `VITE_API_URL`)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Backend connectivity check |
| `GET` | `/summary` | Dashboard summary stats |
| `GET` | `/analytics` | Chart data (causes, hours, corridors) |
| `GET` | `/events` | Incident log with filters/pagination |
| `GET` | `/hotspots` | Map marker coordinates |
| `POST` | `/predict` | Congestion prediction + deployment recs |
| `GET` | `/similar/:id` | Top-3 similar historical events |
| `POST` | `/feedback` | Submit officer ground-truth |
| `GET` | `/feedback` | Feedback history + accuracy |
| `GET` | `/meta/causes` | Event cause dropdown values |
| `GET` | `/meta/corridors` | Corridor dropdown values |
| `GET` | `/meta/zones` | Zone dropdown values |

When any endpoint returns null (timeout, error, or empty), `src/data/demoData.ts` activates. The status indicator in the City Risk Index panel shows **◉ DEMO DATA** (amber) vs **◉ LIVE DATA** (green).

---

## Project Structure

```
artifacts/gridsense/
├── src/
│   ├── api/client.ts               # Axios client, 5s timeout
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── CityRiskIndex.tsx   # SVG risk dial + detail drawer
│   │   │   └── AlertFeed.tsx       # Live action log
│   │   ├── layout/
│   │   │   ├── Shell.tsx           # Desktop grid + mobile bottom nav
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx          # Health check, backend status
│   │   │   └── StatusBar.tsx
│   │   └── ui/
│   │       ├── Badge.tsx           # Priority/status badges
│   │       ├── Skeleton.tsx        # Shimmer loaders
│   │       ├── CornerMarks.tsx     # L-bracket focus indicators
│   │       └── OpsButton.tsx
│   ├── context/
│   │   ├── ToastContext.tsx        # Toast stack (Framer Motion)
│   │   └── AlertFeedContext.tsx
│   ├── data/demoData.ts            # Graceful degradation fallback
│   ├── hooks/
│   │   ├── useAnalytics.ts
│   │   ├── usePredict.ts
│   │   └── useMeta.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Predict.tsx
│   │   ├── Map.tsx
│   │   ├── Similarity.tsx
│   │   ├── Feedback.tsx
│   │   └── About.tsx
│   ├── utils/predictUtils.ts       # Contributing factors, baselines
│   ├── App.tsx
│   └── index.css                   # Keyframes: shimmer, ticker, pulse, spin
├── public/
├── vite.config.ts
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Charts | Recharts |
| Maps | Leaflet + react-leaflet |
| HTTP | Axios (5s timeout, demo fallback) |
| Routing | React Router 7 |
| Fonts | Space Grotesk + Space Mono |

---

## Design System

Operational tools aesthetic — parchment background, terracotta accent, sharp corners. No gradients, no glows, no generic AI dashboard defaults.

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#EAE8E1` | Page shell |
| Surface | `#E2E0D8` | Cards, panels |
| Border | `#C8C5BC` | Panel dividers |
| Text | `#1A1A18` | Primary content |
| Muted | `#9A9690` | Labels (9px mono uppercase) |
| Accent | `#C84B2F` | High risk, critical |
| Warning | `#B8820A` | Medium risk, elevated |
| Success | `#2D6A4F` | Low risk, live status |
| Ops Blue | `#4A6E8A` | Info, planned alerts |

Typography: **Space Grotesk** for display and body; **Space Mono** for labels, data values, and buttons.

---

## Dataset

| Field | Value |
|-------|-------|
| Source | Bangalore Traffic Incident Dataset |
| Records | 8,173 incidents |
| Period | January – May 2024 |
| Fields | Cause · Corridor · Zone · Priority · Road Closure · Police Station · Duration · Time Features |

---

<div align="center">

**GridSense** — *Predict. Deploy. Prevent.*

Built for Bangalore Traffic Police · Gridlock Hackathon 2.0

[grid-sense-gridsense.vercel.app](https://grid-sense-gridsense.vercel.app)

</div>
