package com.example.thymeleaf.controller;

import com.example.thymeleaf.entity.Dept;
import com.example.thymeleaf.entity.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Controller
public class ThymeleafController {

    /**
     * 步骤3：跳转到登录页面
     */
    @GetMapping("/toLogin")
    public String toLogin(Model model) {
        model.addAttribute("user", new User());
        return "login";
    }

    /**
     * 步骤3：处理登录请求
     */
    @PostMapping("/doLogin")
    public String doLogin(User user, Model model, HttpSession session) {
        if ("admin".equals(user.getUsername()) && "123456".equals(user.getPassword())) {
            session.setAttribute("loginUser", user.getUsername());
            return "redirect:/welcome";
        } else {
            model.addAttribute("error", "用户名或密码错误，请重新输入！");
            model.addAttribute("user", user);
            return "login";
        }
    }

    /**
     * 步骤4：欢迎页面（展示变量 + 日期格式化）
     */
    @GetMapping("/welcome")
    public String welcome(Model model) {
        model.addAttribute("name", "张三");
        model.addAttribute("today", new Date());
        return "welcome";
    }

    /**
     * 步骤5：部门下拉列表页面（th:each循环遍历）
     */
    @GetMapping("/deptList")
    public String deptList(Model model) {
        List<Dept> depts = new ArrayList<>();
        depts.add(new Dept(1, "研发部"));
        depts.add(new Dept(2, "生产部"));
        depts.add(new Dept(3, "销售部"));
        depts.add(new Dept(4, "人事部"));
        model.addAttribute("depts", depts);
        return "deptList";
    }
}
