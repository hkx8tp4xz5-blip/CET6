package com.example.thymeleaf.service;

import com.example.thymeleaf.entity.Exam;
import com.example.thymeleaf.entity.ReadingPassage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.time.Year;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamService {

    @Value("classpath:data/exams.json")
    private Resource examDataResource;

    private final ObjectMapper objectMapper;

    private List<Exam> exams;

    public ExamService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() throws IOException {
        exams = objectMapper.readValue(
                examDataResource.getInputStream(),
                new TypeReference<List<Exam>>() {}
        );
    }

    public List<Exam> getAllExams() {
        return exams;
    }

    public List<Exam> getExamsByType(String type) {
        if (type == null || type.isEmpty()) {
            return Collections.emptyList();
        }
        return exams.stream()
                .filter(exam -> type.equals(exam.getType()))
                .collect(Collectors.toList());
    }

    public Exam getExamById(String id) {
        if (id == null || id.isEmpty()) {
            return null;
        }
        return exams.stream()
                .filter(exam -> id.equals(exam.getId()))
                .findFirst()
                .orElse(null);
    }

    public ReadingPassage getPassage(String examId, String passageId) {
        if (examId == null || passageId == null) {
            return null;
        }
        Exam exam = getExamById(examId);
        if (exam == null || exam.getReadingPassages() == null) {
            return null;
        }
        return exam.getReadingPassages().stream()
                .filter(passage -> passageId.equals(passage.getId()))
                .findFirst()
                .orElse(null);
    }

    public List<Exam> getRecentExams(int years) {
        int currentYear = Year.now().getValue();
        int thresholdYear = currentYear - years;
        return exams.stream()
                .filter(exam -> {
                    try {
                        int examYear = Integer.parseInt(exam.getYear());
                        return examYear >= thresholdYear;
                    } catch (NumberFormatException e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
    }
}