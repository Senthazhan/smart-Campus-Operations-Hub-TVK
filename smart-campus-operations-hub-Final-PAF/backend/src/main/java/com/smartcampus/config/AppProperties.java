package com.smartcampus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
    String env,
    String frontendBaseUrl,
    String fileStorageRoot,
    long fileMaxBytes,
    String jwtSecret,
    long jwtExpirationMs
) {}

