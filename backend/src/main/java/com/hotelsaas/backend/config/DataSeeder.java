package com.hotelsaas.backend.config;

import com.hotelsaas.backend.model.User;
import com.hotelsaas.backend.model.UserRole;
import com.hotelsaas.backend.model.UserStatus;
import com.hotelsaas.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;

    @Bean
    CommandLineRunner seedDatabase() {
        return args -> {
            // Only seed if no users exist
            if (userRepository.count() == 0) {
                log.info("Seeding database with initial users...");

                // Create Owner
                User owner = new User();
                owner.setName("Gustave H.");
                owner.setEmail("gustave@grandbudapest.com");
                owner.setRole(UserRole.ORG_OWNER);
                owner.setPin("12345");
                owner.setStatus(UserStatus.ACTIVE);
                userRepository.save(owner);
                log.info("Created user: {}", owner.getEmail());

                // Create Employees
                User employee1 = new User();
                employee1.setName("Zero Moustafa");
                employee1.setEmail("zero@grandbudapest.com");
                employee1.setRole(UserRole.ORG_EMPLOYEE);
                employee1.setPin("54321");
                employee1.setStatus(UserStatus.ACTIVE);
                userRepository.save(employee1);
                log.info("Created user: {}", employee1.getEmail());

                User employee2 = new User();
                employee2.setName("Jane Chef");
                employee2.setEmail("jane@grandbudapest.com");
                employee2.setRole(UserRole.ORG_EMPLOYEE);
                employee2.setPin("11111");
                employee2.setStatus(UserStatus.ACTIVE);
                userRepository.save(employee2);
                log.info("Created user: {}", employee2.getEmail());

                User employee3 = new User();
                employee3.setName("Mike Storage");
                employee3.setEmail("mike@grandbudapest.com");
                employee3.setRole(UserRole.ORG_EMPLOYEE);
                employee3.setPin("22222");
                employee3.setStatus(UserStatus.INACTIVE);
                userRepository.save(employee3);
                log.info("Created user: {}", employee3.getEmail());

                log.info("Database seeding completed. Created {} users.", userRepository.count());
            } else {
                log.info("Database already contains {} users. Skipping seed.", userRepository.count());
            }
        };
    }
}
