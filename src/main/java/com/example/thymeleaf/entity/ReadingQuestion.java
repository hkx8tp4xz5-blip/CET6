package com.example.thymeleaf.entity;

import java.util.List;

public class ReadingQuestion {
    private String id;
    private int questionNumber;
    private String questionText;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    private String translation;
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public int getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(int questionNumber) { this.questionNumber = questionNumber; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getTranslation() { return translation; }
    public void setTranslation(String translation) { this.translation = translation; }
}