# Deployment Technical Report

**Project:** TubeForge  
**Date:** 2026-04-26  
**Status:** Deployment Ready

---

## Architecture Overview

### Current Setup

```
Frontend (Vercel)          │  Backend (Railway)
─────────────────────────┼──────────────────────────
index.html               │  Spring Boot JAR
payment.html             │  Port: 8080
login.html               │
app.js ──────────────────► API Calls
style.css                │
```

### URLs

| Service | URL | Status |
|---------|-----|--------|
| Vercel (Frontend) | `tubeforge.vercel.app` | Deployed |
| Railway (Backend) | Not deployed yet | Pending |

---

## Issues Found & Fixed

### 1. CORS Issue - FIXED ✅

**Problem:** CORS only allowed localhost
**File:** `src/main/java/com/tubeforge/config/CorsConfig.java`

**Before:**
```java
.allowedOrigins("http://localhost:8080", "http://localhost:3000")
```

**After:**
```java
.allowedOrigins("*")
```

---

### 2. Backend Build Issue - PENDING

**Problem:** Railway deployment fails because:
- Java 17 required
- Maven build needs to run inside Docker
- Environment variables not set

**Solution:** Use Dockerfile (already created)

```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

### 3. Frontend Routing - FIXED ✅

**Problem:** Vercel returns 404 for /payment.html  
**File:** `vercel.json`

**Fixed Configuration:**
```json
{
  "outputDirectory": "target/classes/static",
  "rewrites": [
    { "source": "/payment", "destination": "/payment.html" },
    { "source": "/login", "destination": "/login.html" },
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 4. API Integration - PENDING

**Problem:** Frontend calls `/api/*` which don't exist on Vercel

**Current (app.js):**
```javascript
const API_BASE = '';
fetch(API_BASE + '/api/ideas', ...)
```

**After Railway deploys, change to:**
```javascript
const API_BASE = 'https://your-railway-app.railway.app';
```

---

## Environment Variables

### Required for Railway

| Variable | Value |
|----------|-------|
| `NVIDIA_API_KEY` | Your NVIDIA API key |
| `PICSART_API_KEY` | Your Picsart API key |
| `SERVER_PORT` | 8080 |

### API Endpoints Available

| Endpoint | Purpose |
|----------|---------|
| `/api/ideas` | Generate video ideas |
| `/api/title` | Generate titles |
| `/api/script` | Generate scripts |
| `/api/thumbnail` | Generate thumbnail briefs |
| `/api/payment/verify` | Verify payment |
| `/api/membership/status` | Get membership status |
| `/api/image/generate` | Generate images |

---

## Deployment Steps

### Step 1: Railway Backend

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `szg-zone/TubeForge`
4. Add Variables:
   - `NVIDIA_API_KEY` = (your key)
   - `PICSART_API_KEY` = (your key)
5. Deploy
6. Get URL: `https://tubeforge-xxxx.railway.app`

### Step 2: Update Frontend

After Railway URL is ready, update these files:

1. `src/main/resources/static/app.js` - line 4
2. `src/main/resources/static/index.html` - line 830  
3. `src/main/resources/static/payment.html` - line 85

Change:
```javascript
const API_BASE = '';  // FROM
const API_BASE = 'https://your-railway-url.railway.app';  // TO
```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Update API_BASE for production"
git push origin main
```

Vercel will auto-deploy.

---

## Files Modified

| File | Purpose |
|------|---------|
| `Dockerfile` | Railway build |
| `railway.json` | Railway config |
| `vercel.json` | Vercel routing |
| `CorsConfig.java` | CORS fix |
| `application.properties` | Env var support |
| `DEPLOYMENT_GUIDE.md` | Full guide |

---

## Build Commands

### Local Build

```bash
# Build JAR
mvn clean package -DskipTests

# Run
java -jar target/tubeforge-1.0.0.jar
```

### Docker Build (for Railway)

```bash
docker build -t tubeforge .
docker run -p 8080:8080 tubeforge
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| 404 on /api/* | Expected - API calls go to Railway |
| CORS error | Already fixed to allow * |
| JAR not found | Use Dockerfile on Railway |
| Payment 404 | Vercel rewrites configured |

---

## Contact

For issues, check:
- `DEPLOYMENT_GUIDE.md` - Full technical guide
- GitHub Issues - Project repository