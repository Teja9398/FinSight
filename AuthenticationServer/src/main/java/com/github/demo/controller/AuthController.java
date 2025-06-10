package com.github.demo.controller;


import com.github.demo.model.User;
import com.github.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {
  @Autowired
  UserRepository repo;

  @GetMapping("/status")
  public String status(){
      return "Up and Running";
  }

  @PostMapping("/signup")
    public User signup(@RequestBody User user){
      System.out.println(user);
      User saved = repo.save(user);
      return saved;
  }

}
