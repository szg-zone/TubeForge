# Person 2: Data Models

## Files Worked On

### 1. AIRequest.java
- **Location:** `src/main/java/com/tubeforge/model/AIRequest.java`
- **What it does:** Defines the data structure for incoming API requests
- **Contains:**
  - `niche` - The YouTube niche/topic
  - `title` - The video title
  - `audience` - Target audience description

### 2. AIResponse.java
- **Location:** `src/main/java/com/tubeforge/model/AIResponse.java`
- **What it does:** Defines the data structure for outgoing API responses
- **Contains:**
  - `result` - The AI-generated content (success case)
  - `success` - Boolean flag for success/failure
  - `error` - Error message (failure case)
- **Helper methods:** `success()` and `error()` factory methods

## Summary
Person 2 was responsible for:
- Creating data models for API requests and responses
- Defining what data is sent from frontend to backend
- Defining what data is sent from backend to frontend
- Making sure data is properly structured for the application
