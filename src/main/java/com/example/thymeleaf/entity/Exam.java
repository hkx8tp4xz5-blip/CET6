package com.example.thymeleaf.entity;

import java.util.List;

public class Exam {
    private String id;
    private String title;
    private String type;
    private String year;
    private String session;
    private List<ReadingPassage> readingPassages;
    private TranslationExercise translation;
    private List<ListeningSection> listeningSections;
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getSession() { return session; }
    public void setSession(String session) { this.session = session; }
    public List<ReadingPassage> getReadingPassages() { return readingPassages; }
    public void setReadingPassages(List<ReadingPassage> readingPassages) { this.readingPassages = readingPassages; }
    public TranslationExercise getTranslation() { return translation; }
    public void setTranslation(TranslationExercise translation) { this.translation = translation; }
    public List<ListeningSection> getListeningSections() { return listeningSections; }
    public void setListeningSections(List<ListeningSection> listeningSections) { this.listeningSections = listeningSections; }
}