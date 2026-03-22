package com.smartcampus.config;

import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.enums.RoleName;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedRoles();
        cleanupDuplicateAdmins();
        seedAdminUser();
        seedTechnicianUser();
    }

    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
                log.info("Seeded role: {}", roleName);
            }
        }
    }

    private void cleanupDuplicateAdmins() {
        // Find all users that might conflict with the default admin
        List<User> conflictUsers = userRepository.findAll().stream()
                .filter(u -> "admin".equals(u.getUsername()) || "admin@smartcampus.com".equals(u.getEmail()))
                .toList();

        if (conflictUsers.size() > 1) {
            log.warn("Found {} duplicate admin users. Cleaning up...", conflictUsers.size());
            userRepository.deleteAll(conflictUsers);
        }
    }

    private void seedAdminUser() {
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseThrow(() -> new RuntimeException("Admin role not found"));

        userRepository.findByUsername("admin").ifPresentOrElse(
            existingAdmin -> {
                boolean updated = false;
                if (existingAdmin.getRole() == null || !existingAdmin.getRole().getId().equals(adminRole.getId())) {
                    existingAdmin.setRole(adminRole);
                    updated = true;
                }
                // Ensure email and status are correct
                if (!"admin@smartcampus.com".equals(existingAdmin.getEmail())) {
                    existingAdmin.setEmail("admin@smartcampus.com");
                    updated = true;
                }
                if (!"ACTIVE".equals(existingAdmin.getStatus())) {
                    existingAdmin.setStatus("ACTIVE");
                    updated = true;
                }
                
                if (updated) {
                    userRepository.save(existingAdmin);
                    log.info("Updated existing admin user with correct role and status");
                }
            },
            () -> {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@smartcampus.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFullName("System Admin");
                admin.setRole(adminRole);
                admin.setDepartment("IT Administration");
                admin.setStatus("ACTIVE");
                admin.setProvider("LOCAL");
                admin.setProviderSubject("local-admin");

                userRepository.save(admin);
                log.info("Seeded default admin user: admin / admin123");
            }
        );
    }

    private void seedTechnicianUser() {
        Role techRole = roleRepository.findByName(RoleName.TECHNICIAN)
                .orElseThrow(() -> new RuntimeException("Technician role not found"));

        userRepository.findByUsername("sajee").ifPresentOrElse(
            existing -> log.info("Technician user 'sajee' already exists"),
            () -> {
                User tech = new User();
                tech.setUsername("sajee");
                tech.setEmail("sajee@smartcampus.com");
                tech.setPassword(passwordEncoder.encode("sajee@1023"));
                tech.setFullName("Sajee Technician");
                tech.setRole(techRole);
                tech.setDepartment("Maintenance");
                tech.setStatus("ACTIVE");
                tech.setProvider("LOCAL");
                tech.setProviderSubject("local-tech-sajee");

                userRepository.save(tech);
                log.info("Seeded technician user: sajee / sajee@1023");
            }
        );
    }
}
