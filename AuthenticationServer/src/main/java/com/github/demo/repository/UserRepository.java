package com.github.demo.repository;

import com.github.demo.model.Users;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<Users,String> {
    Users findUsersByUsername(String name);
    Users findUserByEmail(String email);

//    Users updatePasswordByEmail(String email, String newEncodedPassword);
}
