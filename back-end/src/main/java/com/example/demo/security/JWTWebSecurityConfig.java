package com.example.demo.security;

import lombok.RequiredArgsConstructor;

import org.springframework.security.config.Customizer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class JWTWebSecurityConfig {

    private final UserDetailsService userDetailsService;

    @Value("${sicurezza.uri}")
    private String authenticationPath;

    @Value("${sicurezza.refresh}")
    private String refreshPath;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions().disable()) // Allow H2 console frames
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, authenticationPath).permitAll()
                        .requestMatchers(HttpMethod.GET, refreshPath).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/utenti/inserisci").permitAll()
                        .requestMatchers("/h2-console/**").permitAll() // 👈 H2 Console access
                        // .requestMatchers(
                        // "/swagger-ui/**",
                        // "/v3/api-docs/**",
                        // "/swagger-resources/**",
                        // "/swagger-ui.html",
                        // "/login"
                        // ).permitAll()
                        .requestMatchers("/api/**").authenticated() // 👈 Protegge SOLO le API
                        .requestMatchers("/**").permitAll()
                // .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // 👈 aggiunta qui

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}
