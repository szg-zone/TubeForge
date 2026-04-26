package com.tubeforge.model;

import java.time.LocalDate;

public class Membership {
    private String email;
    private String plan;
    private LocalDate expiryDate;
    private int requestsUsedToday;
    private String lastRequestDate;

    public Membership() {}

    public Membership(String email, String plan, LocalDate expiryDate) {
        this.email = email;
        this.plan = plan;
        this.expiryDate = expiryDate;
        this.requestsUsedToday = 0;
        this.lastRequestDate = LocalDate.now().toString();
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public int getRequestsUsedToday() { return requestsUsedToday; }
    public void setRequestsUsedToday(int requestsUsedToday) { this.requestsUsedToday = requestsUsedToday; }

    public String getLastRequestDate() { return lastRequestDate; }
    public void setLastRequestDate(String lastRequestDate) { this.lastRequestDate = lastRequestDate; }

    public int getDailyLimit() {
        return switch (plan) {
            case "basic" -> 10;
            case "pro" -> 25;
            case "premium" -> Integer.MAX_VALUE;
            default -> 15;
        };
    }

    public boolean canAccessThumbnail() {
        return "pro".equals(plan) || "premium".equals(plan);
    }

    public boolean isActive() {
        return "free".equals(plan) || 
               (expiryDate != null && LocalDate.now().compareTo(expiryDate) <= 0);
    }

    public void incrementUsage() {
        resetDailyIfNeeded();
        this.requestsUsedToday++;
    }

    public void resetDailyIfNeeded() {
        String today = LocalDate.now().toString();
        if (!today.equals(lastRequestDate)) {
            this.requestsUsedToday = 0;
            this.lastRequestDate = today;
        }
    }
}