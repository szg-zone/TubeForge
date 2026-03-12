package com.tubeforge.model;

public class AIResponse {
    private String result;
    private boolean success;
    private String error;

    public AIResponse() {}

    public AIResponse(String result, boolean success, String error) {
        this.result = result;
        this.success = success;
        this.error = error;
    }

    public static AIResponse success(String result) {
        return new AIResponse(result, true, null);
    }

    public static AIResponse error(String error) {
        return new AIResponse(null, false, error);
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
