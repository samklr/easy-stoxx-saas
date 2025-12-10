package com.hotelsaas.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class GcsConfig {

    @Value("${gcs.project-id}")
    private String projectId;

    @Value("${gcs.credentials-path:}")
    private String credentialsPath;

    @Bean
    public Storage storage() throws IOException {
        StorageOptions.Builder builder = StorageOptions.newBuilder()
                .setProjectId(projectId);

        // If credentials path is provided, use it. Otherwise, use default credentials
        if (credentialsPath != null && !credentialsPath.isEmpty()) {
            GoogleCredentials credentials = GoogleCredentials
                    .fromStream(new FileInputStream(credentialsPath));
            builder.setCredentials(credentials);
        }
        // If no path provided, it will use Application Default Credentials (ADC)
        // which works automatically on Google Cloud environments

        return builder.build().getService();
    }
}
