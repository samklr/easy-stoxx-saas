package com.hotelsaas.backend.controller;

import com.hotelsaas.backend.service.ImageStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
public class ImageController {

    @Autowired
    private ImageStorageService imageStorageService;

    /**
     * Upload an image for inventory items
     */
    @PostMapping("/upload/inventory")
    public ResponseEntity<?> uploadInventoryImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = imageStorageService.uploadImage(file, "inventory");

            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Upload an image for user profiles
     */
    @PostMapping("/upload/profile")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = imageStorageService.uploadImage(file, "profiles");

            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Profile image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Delete an image by URL
     */
    @DeleteMapping
    public ResponseEntity<?> deleteImage(@RequestParam("url") String imageUrl) {
        try {
            boolean deleted = imageStorageService.deleteImage(imageUrl);

            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Image not found or already deleted"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete image: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint to verify GCS bucket accessibility
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        boolean accessible = imageStorageService.isBucketAccessible();

        if (accessible) {
            return ResponseEntity.ok(Map.of(
                    "status", "healthy",
                    "message", "GCS bucket is accessible"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "status", "unhealthy",
                            "message", "GCS bucket is not accessible"
                    ));
        }
    }
}
