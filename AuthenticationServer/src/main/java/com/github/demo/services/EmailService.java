package com.github.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String message) {
        System.out.println("$$$$$$$$$$$$$$$$FROM EMAIL IS $$$$$$$$$$$$$$$$$$$$ = " + fromEmail);
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom(fromEmail);
        mailMessage.setTo(to);
        mailMessage.setSubject(subject);
        mailMessage.setText(message + "\n\n VALID ONLY FOR 5 MINUTES.");
        mailSender.send(mailMessage);
    }
}

