package com.tubeforge.model;

public class AIRequest {
    private String email;
    private String niche;
    private String audience;
    private String title;
    private String idea;
    private String tone;
    private String hookStyle;
    private String keywords;
    private String targetLength;
    private String videoLength;
    private String scriptStyle;
    private String customStyle;
    private String[] sections;
    private String topic;
    private String sourceType;

    public AIRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNiche() { return niche; }
    public void setNiche(String niche) { this.niche = niche; }

    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getIdea() { return idea; }
    public void setIdea(String idea) { this.idea = idea; }

    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }

    public String getHookStyle() { return hookStyle; }
    public void setHookStyle(String hookStyle) { this.hookStyle = hookStyle; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public String getTargetLength() { return targetLength; }
    public void setTargetLength(String targetLength) { this.targetLength = targetLength; }

    public String getVideoLength() { return videoLength; }
    public void setVideoLength(String videoLength) { this.videoLength = videoLength; }

    public String getScriptStyle() { return scriptStyle; }
    public void setScriptStyle(String scriptStyle) { this.scriptStyle = scriptStyle; }

    public String getCustomStyle() { return customStyle; }
    public void setCustomStyle(String customStyle) { this.customStyle = customStyle; }

    public String[] getSections() { return sections; }
    public void setSections(String[] sections) { this.sections = sections; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
}