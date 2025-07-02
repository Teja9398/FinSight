package com.github.demo.model;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.mongodb.lang.NonNull;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "users")

public class Users {
    @Id
    @JsonProperty("_id")
    private String id;

    @JsonProperty
    @Field("name")
    private String username;

    @JsonProperty
    @Field("email")
    private String email; //this field also acts as the username

    @JsonProperty
    @Field("passwordHash")
    private String password;

    public Users(){}
    public Users(String id,String username, String email, String password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public String getName() {
        return username;
    }

    public void setName(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getId() {
//        System.out.println("ID:"+id);
        return id;
    }

    @Override
    public String toString() {
        return "Users{" +
                "_id='" + id + '\'' +
                "username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
