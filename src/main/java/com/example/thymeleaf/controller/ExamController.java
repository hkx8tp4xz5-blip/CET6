package com.example.thymeleaf.controller;

import com.example.thymeleaf.entity.Exam;
import com.example.thymeleaf.entity.ListeningSection;
import com.example.thymeleaf.entity.ReadingPassage;
import com.example.thymeleaf.entity.ReadingQuestion;
import com.example.thymeleaf.entity.TranslationExercise;
import com.example.thymeleaf.service.ExamService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping("/")
    public String redirectToExam() {
        return "redirect:/exam";
    }

    @GetMapping("/exam")
    public String listExams(Model model) {
        List<Exam> cet6Exams = examService.getExamsByType("cet6");
        model.addAttribute("cet6Exams", cet6Exams);
        return "exam/index";
    }

    @GetMapping("/exam/{examId}")
    public String examDetail(@PathVariable String examId, Model model) {
        Exam exam = examService.getExamById(examId);
        model.addAttribute("exam", exam);
        model.addAttribute("passages", exam.getReadingPassages());
        model.addAttribute("translation", exam.getTranslation());
        return "exam/detail";
    }

    @GetMapping("/exam/{examId}/reading/{passageId}")
    public String readingPage(@PathVariable String examId, @PathVariable String passageId, Model model) {
        Exam exam = examService.getExamById(examId);
        ReadingPassage passage = examService.getPassage(examId, passageId);
        List<ReadingPassage> passages = exam.getReadingPassages();
        int currentIndex = passages.indexOf(passage);
        model.addAttribute("exam", exam);
        model.addAttribute("passage", passage);
        model.addAttribute("passages", passages);
        model.addAttribute("currentIndex", currentIndex);
        model.addAttribute("newLine", "\n");
        return "exam/reading";
    }

    @GetMapping("/exam/{examId}/translation")
    public String translationPage(@PathVariable String examId, Model model) {
        Exam exam = examService.getExamById(examId);
        model.addAttribute("exam", exam);
        model.addAttribute("translation", exam.getTranslation());
        model.addAttribute("newLine", "\n");
        return "exam/translation";
    }

    @GetMapping("/exam/{examId}/listening/{sectionId}")
    public String listeningPage(@PathVariable String examId, @PathVariable String sectionId, Model model) {
        Exam exam = examService.getExamById(examId);
        List<ListeningSection> sections = exam.getListeningSections();
        ListeningSection section = sections.stream()
            .filter(s -> s.getId().equals(sectionId))
            .findFirst()
            .orElse(null);
        int currentIndex = sections.indexOf(section);
        model.addAttribute("exam", exam);
        model.addAttribute("section", section);
        model.addAttribute("sections", sections);
        model.addAttribute("currentIndex", currentIndex);
        model.addAttribute("newLine", "\n");
        return "exam/listening";
    }

    @GetMapping("/api/exams/{examId}/passages")
    @ResponseBody
    public List<ReadingPassage> getPassages(@PathVariable String examId) {
        Exam exam = examService.getExamById(examId);
        return exam.getReadingPassages();
    }

    @GetMapping("/api/exams/{examId}/answers")
    @ResponseBody
    public Map<String, String> getAnswers(@PathVariable String examId) {
        Exam exam = examService.getExamById(examId);
        Map<String, String> answers = new HashMap<>();
        for (ReadingPassage passage : exam.getReadingPassages()) {
            for (ReadingQuestion question : passage.getQuestions()) {
                answers.put(question.getId(), question.getCorrectAnswer());
            }
        }
        return answers;
    }
}