package com.hotelsaas.backend.controller;

import com.hotelsaas.backend.dto.UserDTO;
import com.hotelsaas.backend.model.User;
import com.hotelsaas.backend.model.UserRole;
import com.hotelsaas.backend.model.UserStatus;
import com.hotelsaas.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(toDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already exists"));
        }

        User user = new User();
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setRole(userDTO.getRole() != null ? userDTO.getRole() : UserRole.ORG_EMPLOYEE);
        user.setPin(userDTO.getPin());
        user.setStatus(userDTO.getStatus() != null ? userDTO.getStatus() : UserStatus.ACTIVE);

        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @Valid @RequestBody UserDTO userDTO) {
        return userRepository.findById(id)
                .map(user -> {
                    // Check if email is being changed to one that already exists
                    if (!user.getEmail().equals(userDTO.getEmail()) &&
                            userRepository.existsByEmail(userDTO.getEmail())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Email already exists"));
                    }

                    user.setName(userDTO.getName());
                    user.setEmail(userDTO.getEmail());
                    user.setRole(userDTO.getRole());
                    user.setPin(userDTO.getPin());
                    user.setStatus(userDTO.getStatus());

                    User updated = userRepository.save(user);
                    return ResponseEntity.ok(toDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setPin(user.getPin());
        dto.setStatus(user.getStatus());
        return dto;
    }
}
