# TubeForge Implementation Plan

This document outlines the architecture and implementation steps to build TubeForge, based on the provided PRD and ARCHITECTURE documents.

## Proposed Changes

### Configuration and Setup
- **`pom.xml`**: Ensure Spring Boot Starter Web, DevTools, and Jackson dependencies are configured.
- **`src/main/resources/application.properties`**: Define server port (8080), AI model details, and the Anthropic API key/URL.

---

### Backend Components

#### Models
- [NEW] `src/main/java/com/tubeforge/model/AIRequest.java`: POJO representing the incoming request from the UI (`niche`, `title`).
- [NEW] `src/main/java/com/tubeforge/model/AIResponse.java`: POJO for the result sent back to the UI (`result`, `success`, `error`).

#### Service Layer
- [NEW] `src/main/resources/prompts/ideas-prompt.txt`: Template to generate video ideas (content provided by user).
- [NEW] `src/main/resources/prompts/script-prompt.txt`: Template to generate a structured script (content provided by user).
- [NEW] `src/main/resources/prompts/thumbnail-prompt.txt`: Template to generate a thumbnail design brief (content provided by user).
- [NEW] `src/main/java/com/tubeforge/service/AIService.java`: Core service containing the HTTPClient logic, loading text files from the classpath, inserting user prompts, and sending POST requests to the Anthropic AI API.

#### Controller & Connectivity
- [NEW] `src/main/java/com/tubeforge/config/CorsConfig.java`: Enables Cross-Origin requests locally.
- [NEW] `src/main/java/com/tubeforge/controller/AIController.java`: Defines the REST endpoints mapping to the Service layer (`/api/ideas`, `/api/script`, `/api/thumbnail`).

---

### Frontend Components Layer
Served from `src/main/resources/static/`:
- [NEW] `index.html`: Main SPA structure (UI design provided by user).
- [NEW] `style.css`: Contains the styling (UI design provided by user).
- [NEW] `app.js`: Contains vanilla JavaScript for tab switching, making `fetch` calls to backend endpoints, and updating the user-provided UI.

## Verification Plan

### Automated/Manual Tests
- **Backend Run**: Start the backend via `mvn spring-boot:run` to verify compilation and that the server starts.
- **Frontend Load**: Navigate to `http://localhost:8080`. Verify the user-provided UI renders correctly.
- **API Tests**: Test the `/api/ideas`, `/api/script`, and `/api/thumbnail` endpoints with the user-provided prompts.
