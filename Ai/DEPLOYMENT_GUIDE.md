# TubeForge Technical Report & Deployment Guide

**Generated:** 2026-04-26  
**Project:** TubeForge - AI-Powered YouTube Studio

---

## 1. Project Structure Analysis

```
TubeForge/
├── src/main/java/com/tubeforge/     # Backend (Spring Boot)
│   ├── TubeForgeApplication.java     # Main class
│   ├── controller/                  # REST APIs
│   │   ├── AIController.java       # /api/ideas, /api/title, /api/script, /api/thumbnail
│   │   ├── PaymentController.java # /api/payment/verify, /api/membership/status
│   │   └── ImageController.java  # /api/image/generate
│   ├── service/                     # Business logic
│   │   ├── AIService.java
│   │   ├── ImageService.java
│   │   └── MembershipService.java
│   ├── model/                     # Data models
│   └── config/
│       └── CorsConfig.java       # CORS configuration
├── src/main/resources/
│   ├── static/                   # Frontend (HTML/CSS/JS)
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── payment.html
│   │   ├── app.js
│   │   └── style.css
│   └── application.properties    # Backend config
├── pom.xml                       # Maven config
├── Dockerfile                   # Railway deployment
├── railway.json                # Railway config
├── vercel.json                # Vercel config
└── .env.example               # Environment template
```

**Frontend:** HTML + CSS + JS (served from `src/main/resources/static/`)  
**Backend:** Spring Boot 3.2.0 with Java 17

---

## 2. Backend Validation

| Check | Status | Notes |
|-------|--------|-------|
| `pom.xml` exists | ✅ | Valid Maven config |
| `packaging=jar` | ✅ | Default (not specified = jar) |
| `spring-boot-maven-plugin` | ✅ | Present in build plugins |
| Main class exists | ✅ | `TubeForgeApplication.java` |
| API endpoints | ✅ | 10 endpoints configured |

**Conclusion:** Backend is a valid Spring Boot project and should generate a JAR file when built.

---

## 3. Build & Run Instructions

### Build Commands

```bash
# Clone and build
git clone https://github.com/szg-zone/TubeForge.git
cd TubeForge

# Build JAR (requires Java 17)
mvn clean package -DskipTests

# Run locally
java -jar target/tubeforge-1.0.0.jar
```

### Local Testing

```bash
# Backend runs on: http://localhost:8080
# Frontend: Open http://localhost:8080 in browser
```

---

## 4. Deployment Fix (Railway)

### Why Railway Fails

1. **Missing JAR** - Railway doesn't run Maven build inside Docker properly
2. **Build command incorrect** - `mvn package` may not execute in Alpine JDK image

### Fixed Railway Configuration

**`railway.json`** (already updated):
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**`Dockerfile`** (already fixed):
```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper and pom first for caching
COPY mvnw mvnw.cmd pom.xml ./
RUN chmod +x mvnw

# Build without running tests
RUN ./mvnw clean package -DskipTests

# Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/tubeforge-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Environment Variables (Set in Railway Dashboard)

| Variable | Value |
|----------|-------|
| `NVIDIA_API_KEY` | Your NVIDIA API key |
| `PICSART_API_KEY` | Your Picsart API key |
| `SERVER_PORT` | 8080 |

### Railway Deploy Steps

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `szg-zone/TubeForge`
4. Add environment variables in Variables tab
5. Deploy

---

## 5. Frontend Fix (Vercel)

### Problem

- `payment.html` returns 404 because Vercel only serves `index.html` by default
- Multiple HTML pages not configured

### Fixed `vercel.json`

```json
{
  "outputDirectory": "target/classes/static",
  "rewrites": [
    { "source": "/payment", "destination": "/payment.html" },
    { "source": "/login", "destination": "/login.html" },
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    }
  ]
}
```

### Vercel Build Settings

- Framework Preset: **Other**
- Build Command: (leave empty)
- Output Directory: (leave empty - using vercel.json)

---

## 6. API Integration

### Current API Calls (from app.js)

```javascript
const API_BASE = '';  // Currently empty - defaults to same origin

// All API calls
fetch(API_BASE + '/api/ideas', ...)
fetch(API_BASE + '/api/title', ...)
fetch(API_BASE + '/api/script', ...)
fetch(API_BASE + '/api/thumbnail', ...)
```

### After Railway Deployment

Set `API_BASE` to your Railway URL in these files:

1. **`src/main/resources/static/app.js`** - line 4
2. **`src/main/resources/static/index.html`** - line 830
3. **`src/main/resources/static/payment.html`** - line 85

```javascript
// Change FROM:
const API_BASE = '';

// Change TO (example):
const API_BASE = 'https://tubeforge-production-xxxx.railway.app';
```

---

## 7. CORS Fix

### Before (Restricted)
```java
.allowedOrigins("http://localhost:8080", "http://localhost:3000")
```

### After (Fixed - Already Applied)
```java
.allowedOrigins("*")
```

This allows requests from any Vercel domain.

---

## 8. Final Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER                                 │
└─────────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                       │
│  https://tubeforge.vercel.app                              │
│                                                             │
│  • index.html                                           │
│  • payment.html                                        │
│  • login.html                                        │
│  • app.js → calls Railway API                          │
└─────────────────────────────┬───────────────────────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                   │
         ▼                                   ▼
   Direct API (mock)                   Railway API
   /api/* (fails)         ──────►  https://tubeforge-xxx.railway.app/api/*
                                    │
                                    ▼
                         ┌────────────────────────────────┐
                         │   SPRING BOOT BACKEND            │
                         │   • /api/ideas                 │
                         │   • /api/title                │
                         │   • /api/script               │
                         │   • /api/thumbnail            │
                         │   • /api/payment/verify       │
                         └────────────────────────────────┘
```

### How It Works

| Request | Goes To |
|---------|--------|
| `vercel.app/` | Vercel → index.html |
| `vercel.app/payment` | Vercel → payment.html |
| `vercel.app/api/ideas` | Vercel → tries backend (404) |
| `app.js` calls Railway | Works → returns AI response |

---

## 9. Environment Variables Summary

### Required for Production

| Variable | Where to Set | Example |
|----------|-------------|---------|
| `NVIDIA_API_KEY` | Railway | `nvapi-xxxx...` |
| `PICSART_API_KEY` | Railway | `paat-xxxx...` |
| `API_BASE` | Frontend files | `https://xxx.railway.app` |

### .env Example (already created)

```
# Server
SERVER_PORT=8080

# NVIDIA
NVIDIA_API_KEY=nvapi-...
NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
NVIDIA_MODEL=qwen/qwen3-next-80b-a3b-instruct
NVIDIA_MAX_TOKENS=4096

# Picsart
PICSART_API_KEY=paat-...
```

---

## 10. Quick Start Checklist

- [ ] Set up Railway with Dockerfile
- [ ] Add `NVIDIA_API_KEY` in Railway variables
- [ ] Add `PICSART_API_KEY` in Railway variables
- [ ] Deploy and get Railway URL
- [ ] Update `API_BASE` in frontend files
- [ ] Push to GitHub
- [ ] Vercel auto-deploys from main branch

---

## 11. Troubleshooting

### "JAR not found" on Railway
→ Use Dockerfile - it builds inside Docker container

### "404 on /api/*" on Vercel  
→ Expected - API calls should go to Railway, not Vercel

### CORS errors
→ Make sure CORS allows your Vercel domain (already fixed to `*`)

---

**End of Report**