package com.example.chatapp;

public class Users {
    String mail, username, userId, lastMessage, status;

    // Empty constructor required for Firebase
    public Users() {}

    public Users(String mail, String username, String userId, String lastMessage, String status) {
        this.mail = mail;
        this.username = username;
        this.userId = userId;
        this.lastMessage = lastMessage;
        this.status = status;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
