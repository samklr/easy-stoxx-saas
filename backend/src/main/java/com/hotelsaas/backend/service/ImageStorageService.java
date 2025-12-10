package com.hotelsaas.backend.service;

import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class ImageStorageService {

    @Autowired
    private Storage storage;

    @Value("${gcs.bucket-name}")
    private String bucketName;

    @Value("${gcs.base-url:https://storage.googleapis.com}")
    private String baseUrl;

    /**
     * Upload an image to GCS and return the public URL
     * @param file The image file to upload
     * @param folder The folder/prefix in the bucket (e.g., "inventory", "users")
     * @return The public URL of the uploaded image
     * @throws IOException if upload fails
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = folder + "/" + UUID.randomUUID().toString() + extension;

        // Create blob info
        BlobId blobId = BlobId.of(bucketName, filename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(contentType)
                .build();

        // Upload to GCS
        storage.create(blobInfo, file.getBytes());

        // Return public URL
        return String.format("%s/%s/%s", baseUrl, bucketName, filename);
    }

    /**
     * Delete an image from GCS
     * @param imageUrl The public URL of the image to delete
     * @return true if deleted successfully, false otherwise
     */
    public boolean deleteImage(String imageUrl) {
        try {
            // Extract filename from URL
            String filename = extractFilenameFromUrl(imageUrl);
            if (filename == null) {
                return false;
            }

            BlobId blobId = BlobId.of(bucketName, filename);
            return storage.delete(blobId);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extract the filename from a GCS public URL
     */
    private String extractFilenameFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }

        // Expected format: https://storage.googleapis.com/bucket-name/folder/filename.ext
        String prefix = baseUrl + "/" + bucketName + "/";
        if (url.startsWith(prefix)) {
            return url.substring(prefix.length());
        }

        return null;
    }

    /**
     * Check if the bucket exists and is accessible
     */
    public boolean isBucketAccessible() {
        try {
            Bucket bucket = storage.get(bucketName);
            return bucket != null && bucket.exists();
        } catch (Exception e) {
            return false;
        }
    }
}
