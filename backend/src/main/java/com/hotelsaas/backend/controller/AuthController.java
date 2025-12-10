package com.hotelsaas.backend.controller;

import com.hotelsaas.backend.dto.AuthDto;
import com.hotelsaas.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/google-login")
    public AuthDto.AuthResponse googleLogin(@RequestBody AuthDto.GoogleLoginRequest request) {
        return authService.loginWithGoogle(request.getIdToken());
    }
}
