package com.smartcampus.util;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.User;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;

@SpringBootTest
public class DatabaseSeederTest {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void seedDatabase() {
        if (!userRepository.existsById("0")) {
            User testUser = new User();
            testUser.setId("0");
            testUser.setFullName("Test Admin");
            testUser.setEmail("test@admin.com");
            userRepository.save(testUser);
            System.out.println("Seeded test User with ID '0'");
        }

        if (!resourceRepository.existsById("1")) {
            Resource testResource = new Resource();
            testResource.setId("1");
            testResource.setName("Test Postman Resource");
            testResource.setResourceCode("RES-P-01");
            testResource.setCapacity(50);
            testResource.setStatus(ResourceStatus.ACTIVE);
            testResource.setType(ResourceType.MEETING_ROOM);
            testResource.setCreatedAt(Instant.now());
            testResource.setUpdatedAt(Instant.now());
            resourceRepository.save(testResource);
            System.out.println("Seeded test Resource with ID '1'");
        }
    }
}
