# TubeForge 1.0 - Java Project Overview

## What is TubeForge?
TubeForge is a **Spring Boot** application that helps YouTubers generate content using AI. It provides 3 main features:
1. **Video Ideas** - Generate click-worthy title ideas based on a niche
2. **Video Scripts** - Generate complete video scripts from a title
3. **Thumbnail Briefs** - Generate thumbnail design suggestions

## How It Works
1. Frontend sends a request to the API (`/api/ideas`, `/api/script`, `/api/thumbnail`)
2. Controller receives the request and validates input
3. Service calls OpenRouter AI API with custom prompts
4. AI responds with generated content
5. Response is returned to frontend

## Main Java Files

| File | What It Does |
|------|--------------|
| `TubeForgeApplication.java` | Main entry point - starts the Spring Boot app |
| `CorsConfig.java` | Configures CORS so frontend can talk to backend |
| `AIController.java` | Handles API requests - defines 3 endpoints |
| `AIService.java` | Contains AI logic - calls OpenRouter API |
| `AIRequest.java` | Defines what the request looks like |
| `AIResponse.java` | Defines what the response looks like |

## Project Structure
```
src/main/java/com/tubeforge/
├── TubeForgeApplication.java   (Main App)
├── config/
│   └── CorsConfig.java         (CORS Setup)
├── controller/
│   └── AIController.java       (API Endpoints)
├── service/
│   └── AIService.java          (AI Logic)
└── model/
    ├── AIRequest.java          (Request Data)
    └── AIResponse.java         (Response Data)
```
