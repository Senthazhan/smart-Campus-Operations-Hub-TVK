package com.smartcampus.service;

import com.smartcampus.dto.request.ResourceCreateRequest;
import com.smartcampus.dto.request.ResourceUpdateRequest;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.entity.Resource;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.mapper.ResourceMapper;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.service.impl.ResourceServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private ResourceMapper resourceMapper;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    private MockedStatic<CurrentUser> currentUserMockedStatic;

    @BeforeEach
    void setUp() {
        currentUserMockedStatic = mockStatic(CurrentUser.class);
    }

    @AfterEach
    void tearDown() {
        currentUserMockedStatic.close();
    }

    @Test
    void createResource_Success() {
        // Arrange
        ResourceCreateRequest request = new ResourceCreateRequest(
                "Laboratory A", "LAB-001", ResourceType.LAB, "Main Lab", 30,
                "Science Block", "1st Floor", "101", "{}", Collections.emptyList(),
                LocalDate.now(), ResourceStatus.ACTIVE
        );

        Resource entity = new Resource();
        entity.setResourceCode("LAB-001");

        ResourceResponse response = new ResourceResponse(
                "id-123", "Laboratory A", "LAB-001", ResourceType.LAB, "Main Lab", 30,
                "Science Block", "1st Floor", "101", "{}", Collections.emptyList(),
                LocalDate.now(), ResourceStatus.ACTIVE, null, null, "user-1", "user-1"
        );

        when(resourceRepository.findByResourceCode("LAB-001")).thenReturn(Optional.empty());
        when(resourceMapper.toEntity(request)).thenReturn(entity);
        when(resourceRepository.save(any(Resource.class))).thenReturn(entity);
        when(resourceMapper.toResponse(entity)).thenReturn(response);
        
        currentUserMockedStatic.when(CurrentUser::id).thenReturn("user-1");

        // Act
        ResourceResponse result = resourceService.create(request);

        // Assert
        assertNotNull(result);
        assertEquals("LAB-001", result.resourceCode());
        verify(resourceRepository).save(any(Resource.class));
    }

    @Test
    void createResource_Conflict_ThrowsException() {
        // Arrange
        ResourceCreateRequest request = new ResourceCreateRequest(
                "Laboratory A", "LAB-001", ResourceType.LAB, "Main Lab", 30,
                "Science Block", "1st Floor", "101", "{}", Collections.emptyList(),
                LocalDate.now(), ResourceStatus.ACTIVE
        );

        when(resourceRepository.findByResourceCode("LAB-001")).thenReturn(Optional.of(new Resource()));

        // Act & Assert
        assertThrows(ConflictException.class, () -> resourceService.create(request));
        verify(resourceRepository, never()).save(any());
    }

    @Test
    void getResourceById_NotFound_ThrowsException() {
        // Arrange
        String id = "invalid-id";
        Authentication auth = mock(Authentication.class);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))).when(auth).getAuthorities();
        currentUserMockedStatic.when(CurrentUser::requireAuth).thenReturn(auth);
        
        when(resourceRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> resourceService.getById(id));
    }

    @Test
    void updateResource_Success() {
        // Arrange
        String id = "id-123";
        ResourceUpdateRequest request = new ResourceUpdateRequest(
                "Updated Lab", "LAB-001", ResourceType.LAB, "Updated Desc", 40,
                "Science Block", "2nd Floor", "202", "{}", Collections.emptyList(),
                LocalDate.now(), ResourceStatus.ACTIVE
        );

        Resource existingEntity = new Resource();
        existingEntity.setId(id);
        existingEntity.setResourceCode("LAB-001");

        ResourceResponse response = new ResourceResponse(
                id, "Updated Lab", "LAB-001", ResourceType.LAB, "Updated Desc", 40,
                "Science Block", "2nd Floor", "202", "{}", Collections.emptyList(),
                LocalDate.now(), ResourceStatus.ACTIVE, null, null, "user-1", "user-1"
        );

        when(resourceRepository.findById(id)).thenReturn(Optional.of(existingEntity));
        when(resourceRepository.findByResourceCode("LAB-001")).thenReturn(Optional.of(existingEntity));
        when(resourceRepository.save(any(Resource.class))).thenReturn(existingEntity);
        when(resourceMapper.toResponse(existingEntity)).thenReturn(response);
        currentUserMockedStatic.when(CurrentUser::id).thenReturn("user-1");

        // Act
        ResourceResponse result = resourceService.update(id, request);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Lab", result.name());
        verify(resourceMapper).updateEntity(eq(request), eq(existingEntity));
    }

    @Test
    void deleteResource_Success() {
        // Arrange
        String id = "id-123";
        when(resourceRepository.existsById(id)).thenReturn(true);

        // Act
        resourceService.delete(id);

        // Assert
        verify(resourceRepository).deleteById(id);
    }
}
