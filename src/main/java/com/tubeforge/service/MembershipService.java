package com.tubeforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tubeforge.model.Membership;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class MembershipService {

    private static final String DATA_FILE = "memberships.json";
    private final ObjectMapper objectMapper;
    private Map<String, Membership> memberships;

    public MembershipService() {
        this.objectMapper = new ObjectMapper();
        this.memberships = new HashMap<>();
        loadMemberships();
    }

    private void loadMemberships() {
        try {
            File file = new File(DATA_FILE);
            if (file.exists()) {
                JsonNode root = objectMapper.readTree(file);
                root.fields().forEachRemaining(entry -> {
                    String email = entry.getKey();
                    JsonNode node = entry.getValue();
                    Membership m = new Membership();
                    m.setEmail(email);
                    m.setPlan(node.get("plan").asText());
                    m.setExpiryDate(LocalDate.parse(node.get("expiryDate").asText()));
                    m.setRequestsUsedToday(node.get("requestsUsedToday").asInt());
                    m.setLastRequestDate(node.get("lastRequestDate").asText());
                    memberships.put(email, m);
                });
            }
        } catch (IOException e) {
            System.out.println("No existing memberships file, starting fresh");
        }
    }

    public Membership getMembership(String email) {
        return memberships.get(email.toLowerCase());
    }

    public Membership getOrCreateFreeMembership(String email) {
        String key = email.toLowerCase();
        if (!memberships.containsKey(key)) {
            Membership m = new Membership(email, "free", LocalDate.now().plusYears(10));
            memberships.put(key, m);
            saveMemberships();
        }
        return memberships.get(key);
    }

    public void activateMembership(String email, String plan, int amount) {
        String key = email.toLowerCase();
        
        LocalDate expiryDate;
        if ("premium".equals(plan)) {
            expiryDate = LocalDate.now().plusYears(10);
        } else {
            expiryDate = LocalDate.now().plusDays(24);
        }

        Membership m = new Membership(email, plan, expiryDate);
        memberships.put(key, m);
        saveMemberships();
    }

    public void incrementUsage(String email) {
        String key = email.toLowerCase();
        Membership m = memberships.get(key);
        if (m != null) {
            m.incrementUsage();
            saveMemberships();
        }
    }

    public boolean canMakeRequest(String email, String feature) {
        Membership m = getOrCreateFreeMembership(email);
        
        if (!m.isActive()) return false;
        if (feature.equals("thumbnail") && !m.canAccessThumbnail()) return false;
        
        m.resetDailyIfNeeded();
        return m.getRequestsUsedToday() < m.getDailyLimit();
    }

    public int getRemainingRequests(String email) {
        Membership m = getOrCreateFreeMembership(email);
        m.resetDailyIfNeeded();
        int limit = m.getDailyLimit();
        return Math.max(0, limit - m.getRequestsUsedToday());
    }

    private void saveMemberships() {
        try {
            ObjectNode root = objectMapper.createObjectNode();
            memberships.forEach((email, m) -> {
                ObjectNode node = objectMapper.createObjectNode();
                node.put("plan", m.getPlan());
                node.put("expiryDate", m.getExpiryDate().toString());
                node.put("requestsUsedToday", m.getRequestsUsedToday());
                node.put("lastRequestDate", m.getLastRequestDate());
                root.set(email, node);
            });
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(DATA_FILE), root);
        } catch (IOException e) {
            System.err.println("Error saving memberships: " + e.getMessage());
        }
    }
}