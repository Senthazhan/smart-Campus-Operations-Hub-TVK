package com.smartcampus.service.impl;

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
import com.smartcampus.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements com.smartcampus.service.ResourceService {

  private final ResourceRepository resourceRepository;
  private final ResourceMapper resourceMapper;
  private final MongoTemplate mongoTemplate;

  @Override
  public Page<ResourceResponse> search(
      String q,
      ResourceType type,
      ResourceStatus status,
      String building,
      Integer minCapacity,
      Pageable pageable
  ) {
    Authentication auth = CurrentUser.requireAuth();
    boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    if (!isAdmin) {
      status = ResourceStatus.ACTIVE;
    }

    Query query = new Query().with(pageable);
    List<Criteria> criteriaList = new ArrayList<>();

    if (type != null) {
      criteriaList.add(Criteria.where("type").is(type));
    }
    if (status != null) {
      criteriaList.add(Criteria.where("status").is(status));
    }
    if (building != null && !building.isBlank()) {
      criteriaList.add(Criteria.where("building").regex(building, "i"));
    }
    if (minCapacity != null) {
      criteriaList.add(Criteria.where("capacity").gte(minCapacity));
    }
    if (q != null && !q.isBlank()) {
      criteriaList.add(new Criteria().orOperator(
          Criteria.where("name").regex(q, "i"),
          Criteria.where("resourceCode").regex(q, "i"),
          Criteria.where("building").regex(q, "i")
      ));
    }

    if (!criteriaList.isEmpty()) {
      query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
    }

    List<Resource> resources = mongoTemplate.find(query, Resource.class);
    return PageableExecutionUtils.getPage(
        resources,
        pageable,
        () -> mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Resource.class)
    ).map(resourceMapper::toResponse);
  }

  @Override
  public ResourceResponse getById(String id) {
    Authentication auth = CurrentUser.requireAuth();
    boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

    var resource = resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found"));
    if (!isAdmin && resource.getStatus() != ResourceStatus.ACTIVE) {
      throw new NotFoundException("Resource not found");
    }
    return resourceMapper.toResponse(resource);
  }

  @Override
  public ResourceResponse create(ResourceCreateRequest req) {
    resourceRepository.findByResourceCode(req.resourceCode()).ifPresent(r -> {
      throw new ConflictException("Resource code already exists");
    });

    var entity = resourceMapper.toEntity(req);
    entity.setCreatedBy(CurrentUser.id());
    entity.setUpdatedBy(CurrentUser.id());
    entity = resourceRepository.save(entity);
    return resourceMapper.toResponse(entity);
  }

  @Override
  public ResourceResponse update(String id, ResourceUpdateRequest req) {
    var entity = resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found"));
    resourceRepository.findByResourceCode(req.resourceCode())
        .filter(other -> !other.getId().equals(id))
        .ifPresent(other -> { throw new ConflictException("Resource code already exists"); });

    resourceMapper.updateEntity(req, entity);
    entity.setUpdatedBy(CurrentUser.id());
    entity = resourceRepository.save(entity);
    return resourceMapper.toResponse(entity);
  }

  @Override
  public void delete(String id) {
    if (!resourceRepository.existsById(id)) {
      throw new NotFoundException("Resource not found");
    }
    resourceRepository.deleteById(id);
  }
}

