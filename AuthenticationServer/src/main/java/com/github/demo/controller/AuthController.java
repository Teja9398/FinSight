package com.github.demo.controller;


import com.github.demo.model.Users;
import com.github.demo.repository.UserRepository;
import com.github.demo.services.UsersService;
import com.github.demo.services.OtpService;
import com.github.demo.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class AuthController {
  @Autowired
  UserRepository repo;
  @Autowired
  UsersService service;
  @Autowired
  private OtpService otpService;
  @Autowired
  private EmailService emailService;
  @Value("${server.port}")
  private String PORT;

  @GetMapping("/status")
  public Map<String,String> status(){
    System.out.println("Status Checked ");
      return Map.of("Message","Running on port "+ PORT);
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody Users user){
    Map<String,Object> map = service.validateUser(user);
//    Map<String,String> UserToBeReturned = (token != null) ?
//        Map.of("id",service.getUserId(token),"name",user.getName(),"email",user.getEmail()) :
//        Map.of("id","","name",user.getName(),"email",user.getEmail());

//Needs to be Updated
    String token = (String) map.get("token");
    Users userdetails = (Users) map.get("user");
    System.out.println("User Details: " + userdetails);
    Map<String, String> userToBeReturned = new HashMap<>();
    userToBeReturned.put("id", token != null ? service.getUserId(token) : null);
    userToBeReturned.put("name", userdetails.getName());
    userToBeReturned.put("email", userdetails.getEmail());

    return token==null ?
        new ResponseEntity<>(Map.of("message","Invalid username or password"), HttpStatus.UNAUTHORIZED):
        ResponseEntity.ok(Map.of("Message","Login successful","token",token,"user",userToBeReturned));
  }

  @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Users user){
    try{
      System.out.println(user);
      Users savedUser =service.signUp(user);
      return new ResponseEntity<>(Map.of("Message", "User created successfully","user", savedUser ),HttpStatus.CREATED);
    }catch (Exception e){
        System.out.println(e.getMessage());
      return new ResponseEntity<>(Map.of("message",e.getMessage()), HttpStatus.CONFLICT);// to be implemented
    }
  }

  @GetMapping("/getuser/{name}")
  public ResponseEntity<?> getUser(@PathVariable String name){
    Users user = repo.findUsersByUsername(name);
    return user==null?
        new ResponseEntity<>(Map.of("message","User not found"),HttpStatus.NOT_FOUND):
        ResponseEntity.ok(user);
  }

  @PostMapping("/send-otp")
  public ResponseEntity<String> sendOtp(@RequestBody Map<String, String> payload) {
    String email = payload.get("email");
    String otp = otpService.generateOTP(email);
    emailService.sendEmail(email, "Your Finsight OTP Code", "Your OTP is: " + otp);
    return ResponseEntity.ok("OTP sent");
  }

  @PostMapping("/validate-otp")
  public ResponseEntity<String> validateOtp(@RequestBody Map<String, String> payload) {
    String email = payload.get("email");
    String otp = payload.get("otp");
    boolean isValid = otpService.validateOTP(email, otp);
    return isValid?ResponseEntity.ok("OTP is valid") :
        new ResponseEntity<>("Invalid or expired OTP", HttpStatus.UNAUTHORIZED);
  }

  @GetMapping("/getusers")
  public List<Users> getAllUsers()  {
    return service.getUsers();
  }
}
