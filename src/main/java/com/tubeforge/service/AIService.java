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

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.model}")
    private String model;

    @Value("${openrouter.max-tokens}")
    private int maxTokens;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AIService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public AIResponse generateIdeas(String niche, String audience) {
        String prompt = loadPrompt("prompts/ideas-prompt.txt");
        prompt = prompt.replace("{niche}", niche);
        prompt = prompt.replace("{audience}", audience != null && !audience.isEmpty() ? audience : "general audience");

        return callAI(prompt);
    }

    public AIResponse generateScript(String title, String audience) {
        String prompt = loadPrompt("prompts/script-prompt.txt");
        prompt = prompt.replace("{title}", title);
        prompt = prompt.replace("{audience}", audience != null && !audience.isEmpty() ? audience : "general audience");

        return callAI(prompt);
    }

    public AIResponse generateThumbnail(String title) {
        String prompt = loadPrompt("prompts/thumbnail-prompt.txt");
        prompt = prompt.replace("{title}", title);

        return callAI(prompt);
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
                    "max_tokens": %d
                }
                """, model, objectMapper.writeValueAsString(prompt), maxTokens);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("HTTP-Referer", "http://localhost:8080")
                    .header("X-Title", "TubeForge")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(60))
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

    private String loadPrompt(String filename) {
        try {
            var inputStream = getClass().getClassLoader().getResourceAsStream(filename);
            if (inputStream == null) {
                return getDefaultPrompt(filename);
            }
            return new String(inputStream.readAllBytes());
        } catch (IOException e) {
            return getDefaultPrompt(filename);
        }
    }

    private String getDefaultPrompt(String filename) {
        if (filename.contains("ideas")) {
            return """
                You are a YouTube content strategist. Generate 7 unique, high-CTR video title ideas for a YouTube channel about {niche}.
                
                Target audience: {audience}
                
                Requirements:
                - Each title should be click-worthy and curiosity-inducing
                - Use power words and numbers where appropriate
                - Vary the title styles (questions, how-tos, list videos, controversy, etc.)
                - Output only the numbered list, no explanations
                """;
        } else if (filename.contains("script")) {
            return """
                You are a professional YouTube script writer. Write a complete, production-ready video script for a video titled "{title}".
                
                Target audience: {audience}
                
                Structure required:
                1. HOOK (first 30 seconds) - Grab attention immediately
                2. INTRODUCTION - Who you are, what the video is about
                3. MAIN CONTENT - 3-5 key points with details
                4. CALL TO ACTION - Subscribe, like, comment
                5. OUTRO - Wrap up and tease next video
                
                Make it engaging, conversational, and ready to film. Include timing cues.
                """;
        } else {
            return """
                You are a YouTube thumbnail designer expert. Create a detailed thumbnail brief for a video titled "{title}".
                
                Include:
                1. Thumbnail Text - Main headline and secondary text
                2. Background - What visual/scene to use
                3. Color Palette - 3 hex codes that work well
                4. Subject/Face - Expression and pose suggestions
                5. Style - Overall mood (bold, minimal, dramatic, etc.)
                6. What to Avoid - Common mistakes
                
                Make it actionable enough for a designer to create the thumbnail.
                """;
        }
    }
}
