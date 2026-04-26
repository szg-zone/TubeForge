# Architecture Document
## TubeForge — System Architecture
**Version:** 1.0.0  
**Date:** March 2026

---

## 1. System Overview

TubeForge uses a simple **2-tier architecture**: a Java Spring Boot backend and a static HTML/CSS/JS frontend. The backend acts as a secure proxy between the browser and the AI API, ensuring API keys are never exposed to the client.

```
┌─────────────────────────────────────────┐
│           USER'S BROWSER                │
│   HTML + CSS + Vanilla JavaScript       │
│   (Served from Spring Boot /static)     │
└──────────────┬──────────────────────────┘
               │  HTTP fetch() calls
               │  POST /api/ideas
               │  POST /api/script
               │  POST /api/thumbnail
               ▼
┌─────────────────────────────────────────┐
│        JAVA SPRING BOOT BACKEND         │
│   AIController  →  AIService            │
│   (REST API on localhost:8080)          │
└──────────────┬──────────────────────────┘
               │  HTTPS POST
               │  Authorization: Bearer {API_KEY}
               ▼
┌─────────────────────────────────────────┐
│            AI API (Claude etc.)         │
│       https://api.anthropic.com         │
│            /v1/messages                 │
└─────────────────────────────────────────┘
```

---

## 2. Project Folder Structure

```
TubeForge/
│
├── pom.xml                                  ← Maven build config + dependencies
│
└── src/
    └── main/
        ├── java/
        │   └── com/tubeforge/
        │       │
        │       ├── TubeForgeApplication.java     ← @SpringBootApplication entry point
        │       │
        │       ├── controller/
        │       │   └── AIController.java         ← REST endpoints (/api/*)
        │       │
        │       ├── service/
        │       │   └── AIService.java            ← Builds prompts, calls AI API, parses response
        │       │
        │       ├── model/
        │       │   ├── AIRequest.java            ← Incoming request body (title, niche, etc.)
        │       │   └── AIResponse.java           ← Outgoing response wrapper
        │       │
        │       └── config/
        │           └── CorsConfig.java           ← Allows frontend to call backend
        │
        └── resources/
            │
            ├── application.properties            ← API key, port, config
            │
            ├── prompts/
            │   ├── ideas-prompt.txt              ← Prompt template for idea generation
            │   ├── script-prompt.txt             ← Prompt template for script generation
            │   └── thumbnail-prompt.txt          ← Prompt template for thumbnail brief
            │
            └── static/                           ← Frontend lives here (Spring serves this)
                ├── index.html                    ← Main single-page app
                ├── style.css                     ← All styles
                └── app.js                        ← All JS logic (fetch, UI updates)
```

---

## 3. Backend Architecture

### 3.1 Entry Point
```java
// TubeForgeApplication.java
@SpringBootApplication
public class TubeForgeApplication {
    public static void main(String[] args) {
        SpringApplication.run(TubeForgeApplication.class, args);
    }
}
```

### 3.2 Controller Layer — `AIController.java`
Receives HTTP requests from the frontend and delegates to the service layer.

```
Endpoints:
  POST /api/ideas      → body: { "niche": "tech reviews" }
  POST /api/script     → body: { "title": "Top 5 Budget Laptops 2025" }
  POST /api/thumbnail  → body: { "title": "Top 5 Budget Laptops 2025" }

All return:
  { "result": "...AI generated text..." }
```

**Flow:**
```
HTTP Request → @RestController → AIService.generate() → HTTP Response
```

### 3.3 Service Layer — `AIService.java`
Core logic lives here. Responsibilities:
- Load the appropriate prompt template from `/resources/prompts/`
- Inject the user's input into the prompt
- Build the JSON request body for the AI API
- Make the HTTP call using `java.net.http.HttpClient`
- Parse the JSON response and extract the text
- Return the result to the controller

### 3.4 Model Layer
Simple POJOs (Plain Old Java Objects):

```java
// AIRequest.java — what comes IN from the frontend
public class AIRequest {
    private String niche;    // used by /api/ideas
    private String title;    // used by /api/script and /api/thumbnail
}

// AIResponse.java — what goes OUT to the frontend
public class AIResponse {
    private String result;
    private boolean success;
    private String error;
}
```

### 3.5 Configuration — `application.properties`
```properties
server.port=8080
ai.api.key=your_api_key_here
ai.api.url=https://api.anthropic.com/v1/messages
ai.model=claude-sonnet-4-20250514
ai.max_tokens=1500
```

---

## 4. Frontend Architecture

### 4.1 Structure
Single HTML file with 3 tab sections. No frameworks, no build tools.

```
index.html
  └── <nav> Tab bar (Ideas | Script | Thumbnail)
  └── <section id="ideas">   ← Tab 1
  └── <section id="script">  ← Tab 2
  └── <section id="thumbnail"> ← Tab 3
```

### 4.2 JavaScript Flow (`app.js`)

```
User clicks submit
    → showLoading()
    → fetch('POST /api/...', { body: JSON.stringify(input) })
    → .then(response => response.json())
    → displayResult(data.result)
    → hideLoading()
    
    On error:
    → displayError("Something went wrong. Please try again.")
```

### 4.3 Tab Switching Logic
```javascript
// Pure JS tab switching — no library needed
function showTab(tabName) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
}
```

---

## 5. Data Flow — End to End

### Example: User generates a script

```
1. User types "How to Start a YouTube Channel in 2025" into the title field
2. User clicks "Generate Script"
3. app.js calls:
      fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "How to Start a YouTube Channel in 2025" })
      })

4. AIController.java receives POST /api/script
   → calls AIService.generateScript("How to Start a YouTube Channel in 2025")

5. AIService.java:
   → loads script-prompt.txt template
   → injects the title into the prompt
   → builds AI API JSON body
   → sends HTTPS POST to AI API with API key header

6. AI API returns JSON:
   { "content": [{ "type": "text", "text": "# Hook\nImagine having 1000..." }] }

7. AIService.java parses response → extracts text → returns to controller

8. AIController.java returns:
   { "result": "# Hook\nImagine having 1000...", "success": true }

9. app.js receives response → displays script in the output box
```

---

## 6. Security Considerations

| Concern | Approach |
|---|---|
| API key exposure | Key stored in `application.properties` on server only, never sent to browser |
| CORS | Configured to allow only `localhost` in dev |
| Input validation | Backend validates input is not null/empty before calling AI |
| Rate limiting | Not implemented in MVP — add in v2 if deployed publicly |

---

## 7. Dependencies (`pom.xml`)

| Dependency | Purpose |
|---|---|
| `spring-boot-starter-web` | REST API + serves static files |
| `spring-boot-devtools` | Hot reload during development |
| `jackson-databind` | JSON parsing (included with Spring Web) |
| `lombok` (optional) | Reduces boilerplate in model classes |

No database dependency needed for MVP.

---

## 8. How to Run

```bash
# 1. Clone / open project
# 2. Set your API key in application.properties
# 3. Run:
mvn spring-boot:run

# 4. Open browser:
http://localhost:8080
```
