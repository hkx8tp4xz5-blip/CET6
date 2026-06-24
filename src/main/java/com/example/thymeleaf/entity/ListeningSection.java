package com.example.thymeleaf.entity;

import java.util.List;

public class ListeningSection {
    private String id;
    private String title;
    private String script;
    private String audioUrl;
    private List<ReadingQuestion> questions;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getScript() { return script; }
    public void setScript(String script) { this.script = script; }
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public List<ReadingQuestion> getQuestions() { return questions; }
    public void setQuestions(List<ReadingQuestion> questions) { this.questions = questions; }
}