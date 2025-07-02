package com.github.demo.services;

import com.github.demo.model.Users;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.*;

@Service
public class JWTService {
    private String secretKey = null;

    public String generateToken(Users user){
        if (user == null || user.getEmail() == null) {
            throw new IllegalArgumentException("User or username cannot be null");
        }
        Map<String,Object> claims = new HashMap<>();
        return Jwts.builder()
                .claims()
                .add(claims)
                .subject(String.valueOf(user.getId()))
                .add("username", user.getEmail())
                .issuer("DDT")
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis()+(1000*60*60*5))) // 5 hours
                .and()
                .signWith(generateSecretKey())
                .compact();
    }

    public SecretKey generateSecretKey(){
//        byte[] decode = Decoders.BASE64.decode(getSecretKey());

        SecretKey key = Keys.hmacShaKeyFor(getSecretKey().getBytes());
        System.out.println(key);
        return key;
    }

    public String getSecretKey(){
        return  secretKey = "4F68B4EC91135DE18D6BF6F514353PK1MK32BPA2KI12342STANKIMKB";
    }

    private Claims extractAllClaims(String token){
        return Jwts.parser()
                .verifyWith(generateSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUserName(String token) {
        return extractAllClaims(token).get("username", String.class);
    }

    private boolean isExpiredToken(String token){
        Date expiration = extractAllClaims(token).getExpiration();
        return expiration.before(new Date());
    }
    public boolean isValidToken(String token, UserDetails userDetails) {
        return (userDetails.getUsername().equals(extractUserName(token))) && !isExpiredToken(token);
    }
}
