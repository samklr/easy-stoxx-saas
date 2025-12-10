package com.hotelsaas.backend.dto;

import com.hotelsaas.backend.model.UserRole;
import com.hotelsaas.backend.model.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class UserDTO {
    private UUID id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private UserRole role = UserRole.ORG_EMPLOYEE;

    @Pattern(regexp = "\\d{5}", message = "PIN must be exactly 5 digits")
    private String pin;

    private UserStatus status = UserStatus.ACTIVE;
}
