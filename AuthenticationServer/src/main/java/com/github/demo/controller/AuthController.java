package com.github.demo.controller;


import com.github.demo.model.UserPrincipal;
import com.github.demo.model.Users;
import com.github.demo.repository.UserRepository;
import com.github.demo.services.MyUserDetailsService;
import com.github.demo.services.UsersService;
import com.github.demo.services.OtpService;
import com.github.demo.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
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
    userToBeReturned.put("createdAt", userdetails.getCreatedAt().toString());

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
  public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> payload) {
    String email = payload.get("email");
    String otp = otpService.generateOTP(email);
    if(emailService.sendEmail(email, "Your Finsight OTP Code", "Your OTP is: " + otp)){
      return ResponseEntity.ok(Map.of("message", "OTP sent to email","success", true));
    }else{
      return new ResponseEntity<>(Map.of("message", "Failed to send OTP","success",false), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @PostMapping("/validate-otp")
  public ResponseEntity<?> validateOtp(@RequestBody Map<String, String> payload) {
    String email = payload.get("email");
    String otp = payload.get("otp");
    boolean isValid = otpService.validateOTP(email, otp);
    return isValid?
            ResponseEntity.ok().body(Map.of("message", "OTP is valid","success", true)) :
        new ResponseEntity<>( Map.of("message","Invalid or expired OTP","success",false),HttpStatus.UNAUTHORIZED);
  }

  @GetMapping("/getusers")
  public List<Users> getAllUsers()  {
    return service.getUsers();
  }

  @GetMapping("/getuseremails")
  public Map<String,List<String>> getAllUseremails()  {
    List<String> emails = new ArrayList<>();
    for (Users user : service.getUsers()){
      emails.add(user.getEmail());
    }
    return Map.of("emails",emails);
  }

  @PutMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request){
      String email = request.get("email");
      String newPassword = request.get("newPassword");
      String oldPassword = request.get("oldPassword");
        System.out.println("Resetting password for email: " + email);
    try{
      Users updatedUser = service.updatePassword(email, oldPassword, newPassword);
      return updatedUser != null ?
              ResponseEntity.ok(Map.of("message", "Password updated successfully", "user", updatedUser)) :
              new ResponseEntity<>(Map.of("message", "User not found or password update failed"), HttpStatus.NOT_FOUND);
    }
    catch (Exception e){
      return new ResponseEntity<>(Map.of("message", e.getMessage()), HttpStatus.BAD_REQUEST);
    }
  }

}
