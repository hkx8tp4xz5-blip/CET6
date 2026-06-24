package com.example.thymeleaf.entity;

import java.util.List;

public class TranslationExercise {
    private String id;
    private String chineseText;
    private String englishAnswer;
    private List<String> keyPoints;
    private String explanation;
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getChineseText() { return chineseText; }
    public void setChineseText(String chineseText) { this.chineseText = chineseText; }
    public String getEnglishAnswer() { return englishAnswer; }
    public void setEnglishAnswer(String englishAnswer) { this.englishAnswer = englishAnswer; }
    public List<String> getKeyPoints() { return keyPoints; }
    public void setKeyPoints(List<String> keyPoints) { this.keyPoints = keyPoints; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}