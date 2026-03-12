# Product Requirements Document (PRD)
## TubeForge — AI-Powered YouTuber Assistant
**Version:** 1.0.0  
**Date:** March 2026  
**Status:** Draft

---

## 1. Overview

### 1.1 Product Summary
TubeForge is a web-based AI assistant designed specifically for YouTubers. It helps content creators overcome the most time-consuming parts of the creative process — coming up with video ideas, writing scripts, and planning thumbnails — all from a single, simple interface.

### 1.2 Problem Statement
YouTubers struggle with three recurring bottlenecks:
- **Ideation fatigue** — constantly coming up with fresh, relevant video ideas
- **Script writing** — turning a title into a structured, engaging script takes hours
- **Thumbnail planning** — knowing what visuals to create for maximum click-through rate

There is no single tool that handles all three in one place, quickly, and affordably.

### 1.3 Solution
A lightweight web app where a YouTuber can type their niche or a video title and instantly receive:
- A list of video ideas tailored to their niche
- A full video script with intro, body, and outro
- A detailed thumbnail brief with layout, text, color, and style suggestions

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals
- Reduce ideation time from hours to under 2 minutes
- Provide production-ready scripts with zero formatting work
- Give thumbnail direction that a designer or Canva user can immediately act on

### 2.2 Success Metrics (MVP)
| Metric | Target |
|---|---|
| Time to generate ideas | < 10 seconds |
| Time to generate a full script | < 20 seconds |
| Time to generate a thumbnail brief | < 10 seconds |
| App loads with no errors | 100% |
| Mobile-friendly UI | Yes |

---

## 3. Target Users

### Primary User
- **Independent YouTubers** with 0–500K subscribers
- Post 1–4 videos per month
- Work solo or with a small team
- Spend 2–5 hours per video on pre-production

### Secondary User
- **YouTube managers / editors** who handle multiple creator channels
- **Students** learning content creation

---

## 4. Features & Requirements

### 4.1 Feature 1 — Video Idea Generator
**Description:** User inputs a niche or topic keyword, and the app returns 5–8 video title ideas.

**User Story:**  
*As a YouTuber, I want to type my channel niche and receive a list of video ideas so I can pick one to move forward with.*

**Functional Requirements:**
- Input field for niche/topic (text, max 100 characters)
- Submit button triggers API call
- Display 5–8 ideas as a numbered list
- Each idea has a "Use This Title" button that pre-fills the Script and Thumbnail generators
- Loading state shown while waiting for AI response

**Non-Functional Requirements:**
- Response time under 10 seconds
- Ideas must be distinct from each other (AI prompt enforces this)

---

### 4.2 Feature 2 — Script Generator
**Description:** User inputs a video title and receives a full structured script.

**User Story:**  
*As a YouTuber, I want to paste my video title and get a complete script so I can start filming without writing from scratch.*

**Functional Requirements:**
- Input field for video title
- Optional field: audience description (e.g., "beginners", "advanced developers")
- Output includes clearly labeled sections:
  - Hook (first 30 seconds)
  - Introduction
  - Main Content (3–5 points)
  - Call to Action
  - Outro
- Copy-to-clipboard button for the full script
- Character/word count displayed

**Non-Functional Requirements:**
- Script should be between 500–1500 words (adjustable via prompt)
- Output must be readable and well-formatted (not a wall of text)

---

### 4.3 Feature 3 — Thumbnail Brief Generator
**Description:** User inputs a video title and receives a detailed creative brief for their thumbnail.

**User Story:**  
*As a YouTuber, I want to get a thumbnail idea from my title so I know exactly what to design in Canva or send to my designer.*

**Functional Requirements:**
- Input field for video title
- Output includes:
  - Thumbnail text/headline suggestion
  - Recommended background (color, scene, or style)
  - Facial expression or pose suggestion (if person in thumbnail)
  - Color palette (3 hex codes suggested)
  - Visual style (e.g., "bold and dramatic", "clean and minimal")
  - What to avoid
- Copy-to-clipboard button

**Non-Functional Requirements:**
- Brief must be actionable (specific enough to hand to a designer)
- Response time under 10 seconds

---

## 5. Out of Scope (MVP)
- User authentication / login system
- Saving/history of past generations
- Direct image generation
- YouTube API integration
- SEO keyword analysis
- Multilingual support

These may be considered in v2.

---

## 6. UI/UX Requirements
- Single-page app with tab-based navigation (3 tabs: Ideas, Script, Thumbnail)
- Clean, minimal design — dark or light mode acceptable
- Mobile responsive
- No complex onboarding — user should understand the app in under 30 seconds
- Loading spinners/skeleton states for all AI calls
- Error messages shown clearly if API fails

---

## 7. Technical Constraints
- Backend must be Java (Spring Boot)
- Frontend: HTML, CSS, vanilla JavaScript
- AI API: developer's own key (Claude or similar)
- No database required for MVP
- Must run locally via `mvn spring-boot:run`

---

## 8. Timeline (Suggested)

| Phase | Tasks | Duration |
|---|---|---|
| Phase 1 | Project setup, Spring Boot, Maven config | 1–2 days |
| Phase 2 | Backend — 3 API endpoints | 2–3 days |
| Phase 3 | Frontend — HTML/CSS/JS for all 3 features | 3–4 days |
| Phase 4 | Integration testing + polish | 1–2 days |
| **Total** | | **~2 weeks** |

---

## 9. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| AI API rate limits | Medium | Add retry logic + user-facing error messages |
| Slow API responses | Medium | Show loading states, set max_tokens limit |
| Poor quality AI output | Low | Craft detailed, tested prompt templates |
| CORS issues (Java → JS) | Medium | Configure Spring Boot CORS settings |
