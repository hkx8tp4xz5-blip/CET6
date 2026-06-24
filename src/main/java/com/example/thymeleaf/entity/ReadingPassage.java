package com.example.thymeleaf.entity;

import java.util.List;

public class ReadingPassage {
    private String id;
    private String title;
    private String content;
    private String sectionType;
    private List<ReadingQuestion> questions;
    private List<String> wordBank;
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSectionType() { return sectionType; }
    public void setSectionType(String sectionType) { this.sectionType = sectionType; }
    public List<ReadingQuestion> getQuestions() { return questions; }
    public void setQuestions(List<ReadingQuestion> questions) { this.questions = questions; }
    public List<String> getWordBank() { return wordBank; }
    public void setWordBank(List<String> wordBank) { this.wordBank = wordBank; }
    
    public String[] getContentParagraphs() {
        if (content == null || content.isEmpty()) {
            return new String[]{""};
        }
        String trimmed = content.replaceAll("\\n+$", "").replaceAll("^\\n+", "");
        if (trimmed.contains("\n\n")) {
            return trimmed.split("\n\n");
        }
        return new String[]{trimmed};
    }
}