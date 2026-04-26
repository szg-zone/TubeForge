package com.tubeforge.controller;

import com.tubeforge.model.AIResponse;
import com.tubeforge.model.Membership;
import com.tubeforge.service.ImageService;
import com.tubeforge.service.MembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/image")
@CrossOrigin(origins = "*")
public class ImageController {

    private final ImageService imageService;
    private final MembershipService membershipService;

    public ImageController(ImageService imageService, MembershipService membershipService) {
        this.imageService = imageService;
        this.membershipService = membershipService;
    }

    @PostMapping("/generate")
    public ResponseEntity<AIResponse> generateImage(@RequestBody ImageRequest request) {
        if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Prompt is required"));
        }

        String email = request.getEmail() != null ? request.getEmail() : "free@default";
        Membership m = membershipService.getOrCreateFreeMembership(email);
        
        if (!m.isActive()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Membership expired. Please renew at Plans tab."));
        }
        
        if (!m.canAccessThumbnail()) {
            return ResponseEntity.badRequest()
                    .body(AIResponse.error("Image generation requires PRO or higher plan. Upgrade at Plans tab."));
        }

        AIResponse response = imageService.generateImage(
                request.getPrompt().trim(),
                request.getModel(),
                request.getAspect()
        );

        return ResponseEntity.ok(response);
    }

    public static class ImageRequest {
        private String prompt;
        private String model;
        private String aspect;
        private String email;

        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }

        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }

        public String getAspect() { return aspect; }
        public void setAspect(String aspect) { this.aspect = aspect; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}