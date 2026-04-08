package com.smartcampus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.dto.request.ResourceCreateRequest;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.service.ResourceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ResourceControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ResourceService resourceService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createResource_AsAdmin_ReturnsCreated() throws Exception {
        // Arrange
        ResourceCreateRequest request = new ResourceCreateRequest(
                "Seminar Hall", "SEM-101", ResourceType.SEMINAR_ROOM, "Large Sem Hall", 200,
                "Admin Building", "Ground Floor", "G01", "{}",
                LocalTime.of(8, 0), LocalTime.of(17, 0), Collections.emptyList(), LocalDate.now(), ResourceStatus.ACTIVE
        );

        ResourceResponse response = new ResourceResponse(
                "res-1", "Seminar Hall", "SEM-101", ResourceType.SEMINAR_ROOM, "Large Sem Hall", 200,
                "Admin Building", "Ground Floor", "G01", "{}",
                LocalTime.of(8, 0), LocalTime.of(17, 0), Collections.emptyList(), LocalDate.now(), ResourceStatus.ACTIVE, null, null, "admin", "admin"
        );

        when(resourceService.create(any(ResourceCreateRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/v1/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Seminar Hall"))
                .andExpect(jsonPath("$.data.resourceCode").value("SEM-101"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void createResource_AsUser_ReturnsForbidden() throws Exception {
        // Arrange
        ResourceCreateRequest request = new ResourceCreateRequest(
                "Seminar Hall", "SEM-101", ResourceType.SEMINAR_ROOM, "Large Sem Hall", 200,
                "Admin Building", "Ground Floor", "G01", "{}",
                LocalTime.of(8, 0), LocalTime.of(17, 0), Collections.emptyList(), LocalDate.now(), ResourceStatus.ACTIVE
        );

        // Act & Assert
        mockMvc.perform(post("/api/v1/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createResource_InvalidRequest_ReturnsBadRequest() throws Exception {
        // Arrange
        // Missing required fields (name, resourceCode, status, etc.)
        String invalidJson = "{\"capacity\": -1}"; 

        // Act & Assert
        mockMvc.perform(post("/api/v1/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getResource_AsUser_ReturnsSuccess() throws Exception {
        // Arrange
        ResourceResponse response = new ResourceResponse(
                "res-1", "Seminar Hall", "SEM-101", ResourceType.SEMINAR_ROOM, "Large Sem Hall", 200,
                "Admin Building", "Ground Floor", "G01", "{}",
                LocalTime.of(8, 0), LocalTime.of(17, 0), Collections.emptyList(), LocalDate.now(), ResourceStatus.ACTIVE, null, null, "admin", "admin"
        );

        when(resourceService.getById("res-1")).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/v1/resources/res-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value("res-1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteResource_AsAdmin_ReturnsNoContent() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/v1/resources/res-1"))
                .andExpect(status().isNoContent());
    }
}
