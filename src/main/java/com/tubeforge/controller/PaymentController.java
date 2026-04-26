package com.tubeforge.controller;

import com.tubeforge.model.AIResponse;
import com.tubeforge.model.Membership;
import com.tubeforge.model.PaymentVerifyRequest;
import com.tubeforge.service.MembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final MembershipService membershipService;

    public PaymentController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @PostMapping("/payment/verify")
    public ResponseEntity<AIResponse> verifyPayment(@RequestBody PaymentVerifyRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Email is required"));
        }
        if (request.getUtr() == null || request.getUtr().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("UTR/Ref ID is required"));
        }
        if (request.getPlan() == null || request.getPlan().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Plan is required"));
        }

        String utr = request.getUtr().trim();
        if (utr.length() < 10 || utr.length() > 20) {
            return ResponseEntity.badRequest().body(AIResponse.error("Invalid UTR format"));
        }

        int expectedAmount = switch (request.getPlan()) {
            case "basic" -> 149;
            case "pro" -> 349;
            case "premium" -> 699;
            default -> 0;
        };

        if (expectedAmount == 0) {
            return ResponseEntity.badRequest().body(AIResponse.error("Invalid plan"));
        }

        if (request.getAmount() != expectedAmount) {
            return ResponseEntity.badRequest()
                    .body(AIResponse.error("Amount mismatch. Expected: ₹" + expectedAmount));
        }

        membershipService.activateMembership(
                request.getEmail().trim(),
                request.getPlan(),
                request.getAmount()
        );

        Membership m = membershipService.getMembership(request.getEmail().trim());
        String expiryText = m.getExpiryDate().toString();
        
        String message = "Payment verified! Your " + request.getPlan() + " plan is now active. " +
                        "Expires on: " + expiryText;
        
        return ResponseEntity.ok(AIResponse.success(message));
    }

    @GetMapping("/membership/status")
    public ResponseEntity<AIResponse> getMembershipStatus(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(AIResponse.error("Email is required"));
        }

        Membership m = membershipService.getOrCreateFreeMembership(email.trim());
        
        String status = String.format("Plan: %s | Daily Limit: %d | Used Today: %d | Expires: %s",
                m.getPlan().toUpperCase(),
                m.getDailyLimit(),
                m.getRequestsUsedToday(),
                m.getExpiryDate().toString()
        );
        
        return ResponseEntity.ok(AIResponse.success(status));
    }

    @GetMapping("/plans")
    public ResponseEntity<AIResponse> getPlans() {
        String plans = """
            FREE - ₹0/day
            - 3 requests/day
            - Ideas + Script only
            
            BASIC - ₹149 (24 days)
            - 10 requests/day
            - Ideas + Script only
            
            PRO - ₹349 (24 days)
            - 25 requests/day
            - Ideas + Script + Thumbnail
            
            PREMIUM - ₹699 (Lifetime)
            - Unlimited requests
            - All features
            """;
        
        return ResponseEntity.ok(AIResponse.success(plans));
    }
}