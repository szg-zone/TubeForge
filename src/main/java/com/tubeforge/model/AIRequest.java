package com.tubeforge.model;

public class AIRequest {
    private String niche;
    private String title;
    private String audience;

    public AIRequest() {}

    public String getNiche() {
        return niche;
    }

    public void setNiche(String niche) {
        this.niche = niche;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = audience;
    }
}
