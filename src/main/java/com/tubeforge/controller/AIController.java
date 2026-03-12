package com.tubeforge.controller;

import com.tubeforge.model.AIRequest;
import com.tubeforge.model.AIResponse;
import com.tubeforge.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/ideas")
    public ResponseEntity<AIResponse> generateIdeas(@RequestBody AIRequest request) {
        if (request.getNiche() == null || request.getNiche().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Niche is required"));
        }

        AIResponse response = aiService.generateIdeas(
                request.getNiche().trim(),
                request.getAudience()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/script")
    public ResponseEntity<AIResponse> generateScript(@RequestBody AIRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Title is required"));
        }

        AIResponse response = aiService.generateScript(
                request.getTitle().trim(),
                request.getAudience()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/thumbnail")
    public ResponseEntity<AIResponse> generateThumbnail(@RequestBody AIRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Title is required"));
        }

        AIResponse response = aiService.generateThumbnail(request.getTitle().trim());

        return ResponseEntity.ok(response);
    }
}
