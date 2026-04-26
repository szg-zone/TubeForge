package com.tubeforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tubeforge.model.AIResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class AIService {

    @Value("${nvidia.api.key}")
    private String apiKey;

    @Value("${nvidia.api.url}")
    private String apiUrl;

    @Value("${nvidia.model}")
    private String model;

    @Value("${nvidia.max-tokens}")
    private int maxTokens;

    @Value("${nvidia.temperature}")
    private double temperature;

    @Value("${nvidia.top_p}")
    private double topP;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AIService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public AIResponse generateIdeas(String niche, String audience, String idea) {
        String prompt = """
            You are a YouTube content strategist. Expand and improve the following video idea concept.

            Channel Niche: {niche}
            Target Audience: {audience}
            Original Idea: {idea}

            Generate 3-5 expanded paragraphs (2-5 lines each) that:
            - Flesh out the concept in more detail
            - Add unique angles or perspectives
            - Make it more engaging and click-worthy
            - Suggest potential hooks or angles

            Format: Numbered paragraphs (1., 2., 3., etc.), no extra explanations.
            Each paragraph should be a complete thought that can stand alone.
            """;
        
        prompt = prompt.replace("{niche}", niche);
        prompt = prompt.replace("{audience}", audience != null && !audience.isEmpty() ? audience : "general audience");
        prompt = prompt.replace("{idea}", idea != null && !idea.isEmpty() ? idea : "any interesting video concept");

        return callAI(prompt);
    }

    public AIResponse generateTitle(String idea, String niche, String audience, String tone, String hookStyle, String keywords, String targetLength) {
        String prompt = """
            Generate 5-7 YouTube title variations for this video idea.

            Idea/Concept: {idea}
            Channel Niche: {niche}
            Target Audience: {audience}
            Tone: {tone}
            Hook Style: {hookStyle}
            Keywords to include: {keywords}
            Target Length: {targetLength}

            Requirements:
            - Each title should be click-worthy and curiosity-inducing
            - Vary the approaches (use different hook styles)
            - Respect the tone: {tone}
            - Include keywords if specified: {keywords}
            - Keep within target character length: {targetLength}
            - Use power words and numbers where appropriate
            - Do NOT use quotes around titles

            Format: Numbered list only (1. Title here), no explanations.
            """;
        
        prompt = prompt.replace("{idea}", idea);
        prompt = prompt.replace("{niche}", niche != null && !niche.isEmpty() ? niche : "general");
        prompt = prompt.replace("{audience}", audience != null && !audience.isEmpty() ? audience : "general audience");
        prompt = prompt.replace("{tone}", tone != null && !tone.isEmpty() ? tone : "Casual");
        prompt = prompt.replace("{hookStyle}", hookStyle != null && !hookStyle.isEmpty() ? hookStyle : "Leave Optional");
        prompt = prompt.replace("{keywords}", keywords != null && !keywords.isEmpty() ? keywords : "none specified");
        prompt = prompt.replace("{targetLength}", targetLength != null && !targetLength.isEmpty() ? targetLength : "Medium");

        return callAI(prompt);
    }

    public AIResponse generateScript(String title, String idea, String audience, String videoLength, String scriptStyle, String customStyle, String[] sections) {
        String wordCount = calculateWordCount(videoLength);
        String styleDescription = getStyleDescription(scriptStyle, customStyle);
        String sectionsList = buildSectionsList(sections);
        
        String prompt = """
            Write a YouTube video script with these specifications:

            Title: {title}
            Concept/Idea: {idea}
            Target Audience: {audience}
            Video Length: {videoLength} (approximately {wordCount} words)
            Script Style: {styleDescription}
            Include Sections: {sectionsList}

            Structure the script clearly with labeled sections:
            {sectionsList}

            Write in a {styleDescription} style. Make it engaging, conversational, and ready to film.
            Include timing cues where appropriate.
            """;
        
        prompt = prompt.replace("{title}", title);
        prompt = prompt.replace("{idea}", idea != null && !idea.isEmpty() ? idea : "the video topic");
        prompt = prompt.replace("{audience}", audience != null && !audience.isEmpty() ? audience : "general audience");
        prompt = prompt.replace("{videoLength}", videoLength != null && !videoLength.isEmpty() ? videoLength : "5 min");
        prompt = prompt.replace("{wordCount}", wordCount);
        prompt = prompt.replace("{styleDescription}", styleDescription);
        prompt = prompt.replace("{sectionsList}", sectionsList);

        return callAI(prompt);
    }

    public AIResponse generateThumbnail(String sourceType, String title, String idea, String topic) {
        String content = "title".equals(sourceType) ? title : idea;
        String contentType = "title".equals(sourceType) ? "video title" : "video idea/concept";
        
        String prompt = """
            Create a detailed, professional thumbnail prompt for a YouTube video.

            Video {contentType}: {content}
            General Topic/Niche: {topic}

            Include ALL of the following sections:

            1. TEXT OVERLAYS
               - Main headline text (what words to show)
               - Secondary text (if any)
               - Text positioning and size suggestions

            2. COLOR PALETTE
               - 3-5 hex color codes
               - Mood they convey (bold, trustworthy, energetic, etc.)

            3. ELEMENTS/OBJECTS
               - What visual elements to include
               - Icons, graphics, or objects to feature
               - Any specific items that grab attention

            4. COMPOSITION
               - Layout suggestion (rule of thirds, centered, etc.)
               - Focal points
               - How to arrange elements on the 16:9 frame

            5. STYLE DIRECTION
               - Overall aesthetic (realistic, cartoonish, bold, minimalist, etc.)
               - Reference styles if applicable

            6. SUBJECT/EXPRESSION
               - Face expressions to capture
               - Recommended poses
               - Emotional tone

            7. BACKGROUND/SCENE
               - What visual scene or setting to use
               - Props or environment elements

            8. WHAT TO AVOID
               - Common mistakes for this type of thumbnail
               - Colors or elements that don't work

            Make this detailed enough for an image generation tool or designer to create an effective, click-worthy thumbnail.
            """;
        
        prompt = prompt.replace("{contentType}", contentType);
        prompt = prompt.replace("{content}", content != null && !content.isEmpty() ? content : "interesting video content");
        prompt = prompt.replace("{topic}", topic);

        return callAI(prompt);
    }

    private String calculateWordCount(String videoLength) {
        if (videoLength == null) return "750-900";
        return switch (videoLength) {
            case "30 sec" -> "75-100";
            case "1 min" -> "150-200";
            case "3 min" -> "400-500";
            case "5 min" -> "750-900";
            case "10+ min" -> "1500-2000";
            default -> "750-900";
        };
    }

    private String getStyleDescription(String scriptStyle, String customStyle) {
        if (scriptStyle == null || scriptStyle.isEmpty()) return "MrBeast style (high-energy, fast-paced)";
        if ("Custom".equals(scriptStyle) && customStyle != null && !customStyle.isEmpty()) {
            return "style of " + customStyle;
        }
        return switch (scriptStyle) {
            case "MrBeast" -> "MrBeast style (high-energy, fast-paced, retention-focused)";
            case "Educational" -> "educational/explainer style (clear, structured, informative)";
            case "Vlog" -> "vlog/casual style (personal, conversational, relatable)";
            case "Documentary" -> "documentary/cinematic style (storytelling, dramatic, immersive)";
            case "Review" -> "product review/tutorial style (step-by-step, practical)";
            default -> "engaging YouTube style";
        };
    }

    private String buildSectionsList(String[] sections) {
        if (sections == null || sections.length == 0) {
            return "HOOK, INTRODUCTION, MAIN CONTENT, CALL TO ACTION, OUTRO";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < sections.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(sections[i].toUpperCase());
        }
        return sb.toString();
    }

    private AIResponse callAI(String prompt) {
        try {
            String requestBody = String.format("""
                {
                    "model": "%s",
                    "messages": [
                        {
                            "role": "user",
                            "content": %s
                        }
                    ],
                    "max_tokens": %d,
                    "temperature": %.1f,
                    "top_p": %.1f,
                    "stream": false
                }
                """, model, objectMapper.writeValueAsString(prompt), maxTokens, temperature, topP);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(120))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return AIResponse.error("API error: " + response.statusCode() + " - " + response.body());
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode choices = rootNode.get("choices");

            if (choices == null || choices.isEmpty() || choices.size() == 0) {
                return AIResponse.error("No response from AI");
            }

            String content = choices.get(0).get("message").get("content").asText();
            return AIResponse.success(content);

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return AIResponse.error("Request failed: " + e.getMessage());
        }
    }
}