package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class SmartCampusApplication {
  public static void main(String[] args) {
    loadEnv();
    SpringApplication.run(SmartCampusApplication.class, args);
  }

  private static void loadEnv() {
    try {
      if (Files.exists(Paths.get(".env"))) {
        List<String> lines = Files.readAllLines(Paths.get(".env"));
        for (String line : lines) {
          line = line.trim();
          if (line.isEmpty() || line.startsWith("#")) continue;
          int sep = line.indexOf('=');
          if (sep > 0) {
            String key = line.substring(0, sep).trim();
            String value = line.substring(sep + 1).trim();
            if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
              value = value.substring(1, value.length() - 1);
            }
            if (System.getProperty(key) == null && System.getenv(key) == null) {
              System.setProperty(key, value);
            }
          }
        }
      }
    } catch (IOException e) {
      System.err.println("Failed to load .env file: " + e.getMessage());
    }
  }
}

