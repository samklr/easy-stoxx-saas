package com.hotelsaas.backend.config;

import com.hotelsaas.backend.model.User;
import com.hotelsaas.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(TestUsersConfig.class)
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final TestUsersConfig testUsersConfig;

    @Bean
    CommandLineRunner seedDatabase() {
        return args -> {
            // Only seed if no users exist
            if (userRepository.count() == 0) {
                log.info("Seeding database with test users from configuration...");

                if (testUsersConfig.getUsers().isEmpty()) {
                    log.warn("No test users configured in test-users.yml");
                    return;
                }

                // Create users from YAML configuration
                int createdCount = 0;
                for (TestUsersConfig.TestUserData userData : testUsersConfig.getUsers()) {
                    try {
                        User user = new User();
                        user.setName(userData.getName());
                        user.setEmail(userData.getEmail());
                        user.setRole(userData.getRoleEnum());
                        user.setPin(userData.getPin());
                        user.setStatus(userData.getStatusEnum());

                        userRepository.save(user);
                        createdCount++;

                        log.info("Created user: {} ({}) - {}",
                            user.getEmail(),
                            user.getRole(),
                            userData.getDescription());
                    } catch (Exception e) {
                        log.error("Failed to create user: {} - {}", userData.getEmail(), e.getMessage());
                    }
                }

                log.info("Database seeding completed. Created {} out of {} configured users.",
                    createdCount, testUsersConfig.getUsers().size());
            } else {
                log.info("Database already contains {} users. Skipping seed.", userRepository.count());
            }
        };
    }
}
