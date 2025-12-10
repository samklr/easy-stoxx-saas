package com.hotelsaas.backend.config;

import com.hotelsaas.backend.model.UserRole;
import com.hotelsaas.backend.model.UserStatus;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "")
@Data
public class TestUsersConfig {

    private List<TestUserData> users = new ArrayList<>();

    @Data
    public static class TestUserData {
        private String name;
        private String email;
        private String role;
        private String pin;
        private String status;
        private String description;

        public UserRole getRoleEnum() {
            return UserRole.valueOf(role);
        }

        public UserStatus getStatusEnum() {
            return UserStatus.valueOf(status);
        }
    }
}
