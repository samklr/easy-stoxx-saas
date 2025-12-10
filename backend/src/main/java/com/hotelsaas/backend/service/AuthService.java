package com.hotelsaas.backend.service;

import com.hotelsaas.backend.dto.AuthDto;
import com.hotelsaas.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    // Placeholder login logic until JwtService and Google Verification is
    // implemented
    public AuthDto.AuthResponse loginWithGoogle(String idToken) {
        // TODO: Verify Google Token (using Google IdTokenVerifier)
        // TODO: Find or Create User
        // TODO: Generate App JWT

        // Mock response
        return new AuthDto.AuthResponse("mock-jwt-token", "Mock User", "mock@example.com", "ORG_OWNER");
    }
}
