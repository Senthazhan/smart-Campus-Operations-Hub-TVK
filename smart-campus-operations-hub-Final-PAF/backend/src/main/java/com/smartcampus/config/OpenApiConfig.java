package com.smartcampus.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  OpenAPI openAPI() {
    return new OpenAPI()
        .info(new Info()
            .title("Smart Campus Operations Hub API")
            .version("v1")
            .description("REST API for resources, bookings, tickets, notifications, and admin management.")
            .license(new License().name("Academic use")));
  }
}

