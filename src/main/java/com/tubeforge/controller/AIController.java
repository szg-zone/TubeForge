package com.tubeforge.controller;

import com.tubeforge.model.AIRequest;
import com.tubeforge.model.AIResponse;
import com.tubeforge.model.Membership;
import com.tubeforge.service.AIService;
import com.tubeforge.service.MembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;
    private final MembershipService membershipService;

    public AIController(AIService aiService, MembershipService membershipService) {
        this.aiService = aiService;
        this.membershipService = membershipService;
    }

    @PostMapping("/ideas")
    public ResponseEntity<AIResponse> generateIdeas(@RequestBody AIRequest request) {
        if (request.getNiche() == null || request.getNiche().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Niche is required"));
        }

        String email = request.getEmail() != null ? request.getEmail() : "free@default";
        Membership m = membershipService.getOrCreateFreeMembership(email);
        
        if (!m.isActive()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Membership expired. Please renew at Plans tab."));
        }
        
        if (!membershipService.canMakeRequest(email, "ideas")) {
            int remaining = membershipService.getRemainingRequests(email);
            return ResponseEntity.badRequest()
                    .body(AIResponse.error("Daily limit reached. Upgrade plan for more requests. Remaining: " + remaining));
        }

        AIResponse response = aiService.generateIdeas(
                request.getNiche().trim(),
                request.getAudience(),
                request.getIdea()
        );

        if (response.isSuccess()) {
            membershipService.incrementUsage(email);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/title")
    public ResponseEntity<AIResponse> generateTitle(@RequestBody AIRequest request) {
        if (request.getIdea() == null || request.getIdea().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Idea is required"));
        }

        String email = request.getEmail() != null ? request.getEmail() : "free@default";
        Membership m = membershipService.getOrCreateFreeMembership(email);
        
        if (!m.isActive()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Membership expired. Please renew at Plans tab."));
        }
        
        if (!membershipService.canMakeRequest(email, "title")) {
            int remaining = membershipService.getRemainingRequests(email);
            return ResponseEntity.badRequest()
                    .body(AIResponse.error("Daily limit reached. Upgrade plan for more requests. Remaining: " + remaining));
        }

        AIResponse response = aiService.generateTitle(
                request.getIdea().trim(),
                request.getNiche(),
                request.getAudience(),
                request.getTone(),
                request.getHookStyle(),
                request.getKeywords(),
                request.getTargetLength()
        );

        if (response.isSuccess()) {
            membershipService.incrementUsage(email);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/script")
    public ResponseEntity<AIResponse> generateScript(@RequestBody AIRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Title is required"));
        }

        String email = request.getEmail() != null ? request.getEmail() : "free@default";
        Membership m = membershipService.getOrCreateFreeMembership(email);
        
        if (!m.isActive()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Membership expired. Please renew at Plans tab."));
        }
        
        if (!membershipService.canMakeRequest(email, "script")) {
            int remaining = membershipService.getRemainingRequests(email);
            return ResponseEntity.badRequest()
                    .body(AIResponse.error("Daily limit reached. Upgrade plan for more requests. Remaining: " + remaining));
        }

        AIResponse response = aiService.generateScript(
                request.getTitle().trim(),
                request.getIdea(),
                request.getAudience(),
                request.getVideoLength(),
                request.getScriptStyle(),
                request.getCustomStyle(),
                request.getSections()
        );

        if (response.isSuccess()) {
            membershipService.incrementUsage(email);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/thumbnail")
    public ResponseEntity<AIResponse> generateThumbnail(@RequestBody AIRequest request) {
        if (request.getTopic() == null || request.getTopic().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Topic/niche is required"));
        }

        String email = request.getEmail() != null ? request.getEmail() : "free@default";
        Membership m = membershipService.getOrCreateFreeMembership(email);
        
        if (!m.isActive()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Membership expired. Please renew at Plans tab."));
        }
        
        if (!m.canAccessThumbnail()) {
            return ResponseEntity.badRequest()
                    .body(AIResponse.error("Thumbnail feature requires PRO or higher plan. Upgrade at Plans tab."));
        }
        
        if (!membershipService.canMakeRequest(email, "thumbnail")) {
            int remaining = membershipService.getRemainingRequests(email);
            return ResponseEntity.badRequest()
                    .body(AIResponse.error("Daily limit reached. Upgrade plan for more requests. Remaining: " + remaining));
        }

        AIResponse response = aiService.generateThumbnail(
                request.getSourceType(),
                request.getTitle(),
                request.getIdea(),
                request.getTopic().trim()
        );

        if (response.isSuccess()) {
            membershipService.incrementUsage(email);
        }

        return ResponseEntity.ok(response);
    }
}