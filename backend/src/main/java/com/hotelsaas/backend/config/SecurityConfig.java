package com.hotelsaas.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.hotelsaas.backend.config.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(Customizer.withDefaults()) // Uses a Bean by the name of corsConfigurationSource
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/**", "/api/users/**", "/error").permitAll()
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
                // For MVP, we will rely on a custom JWT filter (to be added) or OAuth2 Resource
                // Server
                // If we use standard Resource Server, we need an issuer.
                // For now, enabling it so we can hook it up later.
                // .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults())); // We
                // use custom filter instead

                return http.build();
        }
}
