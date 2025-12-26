package com.github.demo.services;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private final Map<String, OTPDetails> otpStorage = new ConcurrentHashMap<>();

    public String generateOTP(String identifier) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        otpStorage.put(identifier, new OTPDetails(otp, Instant.now().plusSeconds(300)));// valid for 5 mins
        System.out.println("Generated OTP: "+otp);
        return otp;
    }

    public boolean validateOTP(String identifier, String inputOtp) {
        OTPDetails details = otpStorage.get(identifier);
        if (details == null || Instant.now().isAfter(details.expiry)) {
            return false;
        }
        return details.otp.equals(inputOtp);
    }

    private static class OTPDetails {
        String otp;
        Instant expiry;
        OTPDetails(String otp, Instant expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }
}

