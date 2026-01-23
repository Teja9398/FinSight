package com.github.demo.services;

import com.github.demo.model.Users;
import com.github.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UsersService {
    @Autowired
    UserRepository repo;

    @Autowired
    JWTService jwtService;

    @Autowired
    AuthenticationManager authManager;

    public Users signUp(Users user)throws UserAlreadyExistsException {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        user.setPassword(encoder.encode(user.getPassword()));
        if(repo.findUserByEmail(user.getEmail()) != null){
            throw new UserAlreadyExistsException("User with email " + user.getEmail() + " already exists.");
        }
        return repo.save(user);
    }

    public Map<String,Object> validateUser(Users user) {
        System.out.println(user);
        Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(),user.getPassword()));
            if(auth.isAuthenticated()){
                Users userInDB=repo.findUserByEmail(user.getEmail());
//                System.out.println("User found in DB: " + userInDB);
                return Map.of("token",jwtService.generateToken(userInDB),"user",userInDB);
            }
        return null;
    }

    public String getUserId(String token) {
        String userName = jwtService.extractUserName(token);
        Users user = repo.findUserByEmail(userName);
        if (user != null) {
            return user.getId();
        }
        return null;
    }

    public List<Users> getUsers(){
        return repo.findAll();
    }

    public Users getUserByEmail(String email){
        Users user =  repo.findUserByEmail(email);
        if(user != null){
            return user;
        }
        return null;
    }

    public Users updatePassword(String email, String oldPassword,String newPassword)throws PasswordNotMatchException {
        Users user = repo.findUserByEmail(email);
        if(user != null){
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
            if(!encoder.matches(oldPassword,user.getPassword())){
                throw new PasswordNotMatchException("Old password does not match.");
            }
            String newEncodedPassword = encoder.encode(newPassword);
            user.setPassword(newEncodedPassword);
            return repo.save(user);
        }
        return null;
    }

}

class UserAlreadyExistsException extends Exception {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}

class PasswordNotMatchException extends Exception {
    public PasswordNotMatchException(String message) {
        super(message);
    }
}
