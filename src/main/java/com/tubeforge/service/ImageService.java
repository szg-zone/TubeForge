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
public class ImageService {

    @Value("${picsart.api.key}")
    private String apiKey;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ImageService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public AIResponse generateImage(String prompt, String model, String aspect) {
        try {
            int width = 1280;
            int height = 720;
            
            if ("9:16".equals(aspect)) {
                width = 720;
                height = 1280;
            } else if ("1:1".equals(aspect)) {
                width = 1024;
                height = 1024;
            } else if ("4:5".equals(aspect)) {
                width = 960;
                height = 1200;
            }

            String safePrompt = prompt.length() > 1500 ? prompt.substring(0, 1500) : prompt;

            String requestBody = String.format("""
                {
                    "prompt": "%s",
                    "width": %d,
                    "height": %d,
                    "count": 1,
                    "model": "flux"
                }
                """, 
                safePrompt.replace("\"", "'").replace("\n", " "), 
                width, height);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://genai-api.picsart.io/v1/text2image"))
                    .header("Content-Type", "application/json")
                    .header("accept", "application/json")
                    .header("X-Picsart-API-Key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(60))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("Picsart Response: " + response.statusCode() + " - " + response.body());

            if (response.statusCode() != 200 && response.statusCode() != 202) {
                return AIResponse.error("Image API error: " + response.statusCode() + " - " + response.body());
            }

JsonNode rootNode = objectMapper.readTree(response.body());
            String status = rootNode.get("status").asText();
            
            System.out.println("Status: " + status + ", body: " + response.body());
            
            if ("success".equals(status)) {
                JsonNode data = rootNode.get("data");
                if (data == null) {
                    return AIResponse.error("No data in response");
                }
                String imageUrl;
                if (data.isArray()) {
                    imageUrl = data.get(0).get("url").asText();
                } else {
                    imageUrl = data.get("url").asText();
                }
                return AIResponse.success(imageUrl);
            }
            
            if ("processing".equals(status)) {
                // For processing, inference_id is directly in the root or in data
                String inferenceId = null;
                
                if (rootNode.has("inference_id")) {
                    inferenceId = rootNode.get("inference_id").asText();
                } else if (rootNode.has("data")) {
                    JsonNode data = rootNode.get("data");
                    if (data != null) {
                        if (data.isArray() && data.size() > 0) {
                            inferenceId = data.get(0).get("inference_id").asText();
                        } else if (data.has("inference_id")) {
                            inferenceId = data.get("inference_id").asText();
                        }
                    }
                }
                
                if (inferenceId == null) {
                    return AIResponse.error("No inference_id in processing response");
                }
                
                System.out.println("Polling for: " + inferenceId);
                String imageUrl = pollForResult(inferenceId);
                if (imageUrl != null) {
                    return AIResponse.success(imageUrl);
                }
                return AIResponse.error("Image processing took too long. Please try again.");
            }

            return AIResponse.error("Image generation failed: " + status);

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return AIResponse.error("Image generation failed: " + e.getMessage());
        }
    }

    private String pollForResult(String inferenceId) {
        for (int i = 0; i < 45; i++) {
            try {
                System.out.println("Polling attempt " + (i+1));
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }

            try {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://genai-api.picsart.io/v1/text2image/inferences/" + inferenceId))
                        .header("accept", "application/json")
                        .header("X-Picsart-API-Key", apiKey)
                        .GET()
                        .timeout(Duration.ofSeconds(30))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                System.out.println("Poll Response: " + response.statusCode() + " - " + response.body());

                if (response.statusCode() == 200) {
                    JsonNode rootNode = objectMapper.readTree(response.body());
                    String status = rootNode.get("status").asText();
                    
                    if ("success".equals(status)) {
                        JsonNode data = rootNode.get("data");
                        if (data.isArray()) {
                            return data.get(0).get("url").asText();
                        } else {
                            return data.get("url").asText();
                        }
                    }
                    
                    if ("error".equals(status)) {
                        System.out.println("Error status in polling");
                        return null;
                    }
                }
            } catch (Exception e) {
                System.out.println("Poll exception: " + e.getMessage());
            }
        }
        return null;
    }
}