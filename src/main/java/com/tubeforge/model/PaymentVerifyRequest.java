package com.tubeforge.model;

public class PaymentVerifyRequest {
    private String email;
    private String utr;
    private String plan;
    private int amount;

    public PaymentVerifyRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUtr() { return utr; }
    public void setUtr(String utr) { this.utr = utr; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }
}