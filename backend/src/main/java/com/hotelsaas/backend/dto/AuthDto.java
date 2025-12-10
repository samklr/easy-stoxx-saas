package com.hotelsaas.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

public class AuthDto {

    @Data
    public static class GoogleLoginRequest {
        private String idToken;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private String role;
    }
}
