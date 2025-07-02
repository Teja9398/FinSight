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

    public String validateUser(Users user) {
        System.out.println(user);
        Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(),user.getPassword()));
            if(auth.isAuthenticated()){
                Users userInDB=repo.findUserByEmail(user.getEmail());
                return jwtService.generateToken(userInDB);
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

}

class UserAlreadyExistsException extends Exception {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
